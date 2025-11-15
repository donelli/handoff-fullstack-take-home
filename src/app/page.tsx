"use client";

import { useAuth } from "~/providers/auth-provider";
import { UserType } from "~/models/user";
import { ContractorHome } from "~/components/home/ContractorHome";
import { HomeownerHome } from "~/components/home/HomeownerHome";

export default function Home() {
  const { user } = useAuth();

  const isContractor = user?.type === UserType.CONTRACTOR;

  if (isContractor) return <ContractorHome />;

  return <HomeownerHome />;
}
