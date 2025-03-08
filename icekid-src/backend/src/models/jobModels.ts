// Mock database
const jobs: any[] = [
    { id: "1", title: "Web3 Developer", description: "Build decentralized applications." },
    { id: "2", title: "Blockchain Engineer", description: "Design and implement blockchain solutions." },
  ];
  
  export async function getJobListingsFromDB() {
    return jobs;
  }