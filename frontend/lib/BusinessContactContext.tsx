"use client";

import { createContext, useContext } from "react";
import { DEFAULT_CONTACT, type BusinessContact } from "@/lib/siteContent";

const BusinessContactContext = createContext<BusinessContact>(DEFAULT_CONTACT);

/**
 * Makes the admin-managed contact details available to client components
 * (Book Now dialog, checkout confirmation). The locale layout fetches them
 * once and provides them here.
 */
export function BusinessContactProvider({
  contact,
  children,
}: {
  contact: BusinessContact;
  children: React.ReactNode;
}) {
  return <BusinessContactContext.Provider value={contact}>{children}</BusinessContactContext.Provider>;
}

export function useBusinessContact(): BusinessContact {
  return useContext(BusinessContactContext);
}
