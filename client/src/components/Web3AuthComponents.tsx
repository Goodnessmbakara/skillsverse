import React, { useState, useEffect } from 'react';
import Web3Auth from "web3auth";
import { Web3AuthCore } from "@web3auth/core";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

const clientId = "YOUR_CLIENT_ID"; // Replace with your Web3Auth client ID

const web3auth = new Web3AuthCore({
    clientId,
    chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x1", // Ethereum mainnet for example
        rpcTarget: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID", // Replace with your RPC URL
    },
    web3AuthNetwork: "mainnet",
});

const openloginAdapter = new OpenloginAdapter({
    adapter: {
        name: "openlogin",
        version: "1.0.0",
        package: null,
    },
    loginConfig: {
        // Add login providers here
        google: {
            name: "Google",
            clientId: "YOUR_GOOGLE_CLIENT_ID",
            scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        },
        facebook: {
            name: "Facebook",
            clientId: "YOUR_FACEBOOK_CLIENT_ID",
            scope: "email public_profile",
        },
    },
});

web3auth.configureAdapter(openloginAdapter);

const Web3AuthComponent = () => {
    const [user, setUser] = useState(null);
    const [suiKeyPair, setSuiKeyPair] = useState(null);

    const login = async () => {
        try {
            const result = await web3auth.login({
                loginProvider: "google", // Change to your preferred provider
                redirectUrl: window.location.href,
            });
            setUser(result);
            // Generate Sui key pair using Web3Auth private key
            const privateKey = await web3auth.request({ method: "private_key" });
            const keyPair = new Ed25519Keypair(privateKey);
            setSuiKeyPair(keyPair);
        } catch (error) {
            console.error(error);
        }
    };

    const logout = async () => {
        try {
            await web3auth.logout();
            setUser(null);
            setSuiKeyPair(null);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            {user ? (
                <div>
                    <p>Logged in as {user.name}</p>
                    <button onClick={logout}>Logout</button>
                    {suiKeyPair && (
                        <p>
                            Sui Address: {suiKeyPair.getPublicKey().toSuiAddress()}
                        </p>
                    )}
                </div>
            ) : (
                <button onClick={login}>Login with Web3Auth</button>
            )}
        </div>
    );
};

export default Web3AuthComponent;
