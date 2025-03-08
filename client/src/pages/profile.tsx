import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WalletManager from '@/components/auth/WalletManager';
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import suiClient from "@/lib/suiClients";
import { Buffer } from 'buffer';
import { uploadToWalrus } from "@/lib/walrus";

// Define schema (simplified for blockchain)
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  avatar: z.string().url("Invalid URL"),
  type: z.enum(["candidate", "employer"]),
  skills: z.record(z.number().min(0).max(100)), // e.g., { "Rust": 80 }
});

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
  "https://images.unsplash.com/photo-1484981138541-3d074aa97716",
  "https://images.unsplash.com/photo-1425421669292-0c3da3b8f529",
  "https://images.unsplash.com/photo-1496180470114-6ef490f3ff22",
  "https://images.unsplash.com/photo-1491336477066-31156b5e4f35",
  "https://images.unsplash.com/photo-1554774853-719586f82d77",
];

export default function Profile() {
  const [suiNSName, setSuiNSName] = useState<string | null>(null);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const address = WalletManager.getAddress();
  const { toast } = useToast();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
      avatar: AVATAR_OPTIONS[0],
      type: "candidate" as "candidate" | "employer",
      skills: { "JavaScript": 80, "Rust": 70 }, // Default for demo
    },
  });

  // Fetch SuiNS name and existing profile
  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;

      const name = await WalletManager.getSuiNSName();
      setSuiNSName(name);

      const objects = await suiClient.getOwnedObjects({
        owner: address,
        options: { showContent: true },
        // filter: { StructType: '0xYourPackageId::marketplace::Profile' },
      });
      if (objects.data.length) {
        const profile = objects.data[0].data?.content?.fields as any;
        setExistingProfile({
          id: objects.data[0].data?.objectId,
          name: Buffer.from(profile.name).toString(),
          bio_url: Buffer.from(profile.bio_url).toString(),
          avatar_url: Buffer.from(profile.avatar_url).toString(),
          skills: profile.skills.fields.contents.reduce((acc: Record<string, number>, item: any) => {
            acc[Buffer.from(item.fields.key).toString()] = item.fields.value;
            return acc;
          }, {}),
          reputation: parseInt(profile.reputation),
          type: Buffer.from(profile.type).toString(),
        });
        form.reset({
          name: Buffer.from(profile.name).toString(),
          bio: "", // Bio fetched from Walrus separately if needed
          avatar: Buffer.from(profile.avatar_url).toString(),
          type: Buffer.from(profile.type).toString() as "candidate" | "employer",
          skills: profile.skills.fields.contents.reduce((acc: Record<string, number>, item: any) => {
            acc[Buffer.from(item.fields.key).toString()] = item.fields.value;
            return acc;
          }, {}),
        });
      }
    };
    fetchData();
  }, [address, form]);


  const onSubmit = async (data: any) => {
    try {
      if (!address) throw new Error('Not authenticated');

      const bioUrl = await uploadToWalrus(data.bio || "No bio provided", "0xYourPackageId::storage::certify_blob", address);
      const avatarUrl = new TextEncoder().encode(data.avatar);

      const tx = new Transaction();
      const skillsVecMap = tx.makeMoveVec({
        type: '0x2::vec_map::VecMap<vector<u8>, u8>',
        elements: Object.entries(data.skills).map(([key, value]) => {
          const entry = tx.object('0x2::vec_map::Entry<vector<u8>, u8>');
          tx.moveCall({
            target: '0x2::vec_map::insert',
            arguments: [
              entry,
              tx.pure(new TextEncoder().encode(key)),
              tx.pure(value),
            ],
          });
          return entry;
        }),
      });

      if (existingProfile) {
        // Update existing profile
        tx.moveCall({
          target: '0xYourPackageId::marketplace::update_profile',
          arguments: [
            tx.object(existingProfile.id),
            tx.pure(new TextEncoder().encode(data.name)),
            tx.pure(bioUrl),
            tx.pure(avatarUrl),
            skillsVecMap,
            tx.pure(new TextEncoder().encode(data.type)),
          ],
        });
      } else {
        // Create new profile
        tx.moveCall({
          target: '0xYourPackageId::marketplace::create_profile',
          arguments: [
            tx.pure(new TextEncoder().encode(data.name)),
            tx.pure(bioUrl),
            tx.pure(avatarUrl),
            skillsVecMap,
            tx.pure(new TextEncoder().encode(data.type)),
          ],
        });

        // Sponsor transaction for new users
        tx.setSenderIfNotSet('0xYourSponsorAddress'); // Replace with real sponsor address
      }

      signAndExecute(
        {
          transaction: tx,
          account: { address }
        },
        {
          onSuccess: (result) => {
            toast({
              title: existingProfile ? "Profile Updated" : "Profile Created",
              description: `Your profile has been ${existingProfile ? 'updated' : 'created'} successfully!`,
            });
            setExistingProfile({ ...data, bio_url: bioUrl, avatar_url: avatarUrl, reputation: existingProfile?.reputation || 0 });
          },
          onError: (error) => {
            throw error;
          },
        }
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${existingProfile ? 'update' : 'create'} profile: ${error.message}`,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <p className="mb-10 font-mono">
        Hello {suiNSName ? suiNSName : address?.slice(0, 6) + '...' + address?.slice(-4) || 'Not logged in'}
      </p>

      <h1 className="text-3xl font-bold mb-8">
        {existingProfile ? 'Your Profile' : 'Create Your Profile'}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Choose Avatar</FormLabel>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {AVATAR_OPTIONS.map((url) => (
                    <div
                      key={url}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 ${field.value === url ? "border-primary" : "border-transparent"}`}
                      onClick={() => field.onChange(url)}
                    >
                      <img src={url} alt="Avatar option" className="w-full h-32 object-cover" />
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="candidate">Job Seeker</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skills</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., JavaScript:80, Rust:70"
                    onChange={(e) => {
                      const skills = e.target.value.split(',').reduce((acc, pair) => {
                        const [key, value] = pair.split(':').map(s => s.trim());
                        acc[key] = parseInt(value);
                        return acc;
                      }, {});
                      field.onChange(skills);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {existingProfile ? 'Update Profile' : 'Create Profile'}
          </Button>
        </form>
      </Form>

      {existingProfile && (
        <div className="mt-6">
          <p><strong>Reputation:</strong> {existingProfile.reputation}</p>
          <p><strong>Bio URL:</strong> <a href={existingProfile.bio_url} target="_blank">{existingProfile.bio_url}</a></p>
        </div>
      )}
    </div>
  );
}