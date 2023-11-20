"use client";

import { useState, useEffect } from "react";
// import { getProviders, signIn } from "next-auth/react";
import { SessionProvider, signIn } from "next-auth/react";
// import { getProviders } from "next-auth/react"
import { Button } from "./button";

type Provider = {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
  signinParams?: Record<string, string> | null;
};

type Providers = Record<string, Provider>;

const AuthProviders = () => {
  const [providers, setProviders] = useState<Providers | null>(null);
  const 
  // useEffect(() => {
  //   const fetchProviders = async () => {
  //     const res = await getProviders();
  //     setProviders(res);
  //   };

  //   fetchProviders();
  // }, []);

  if (providers) {
    return (
      <div>
        {Object.values(providers).map((provider: Provider, i) => (
          <button
            key={i}
            title="Sign In"
            onClick={() => signIn()}
          />
        ))}
      </div>
    );
  }
};

export default AuthProviders;
