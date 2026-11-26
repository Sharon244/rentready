const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const r = await fetch(API + path, options);

  if (!r.ok) {
    const b = await r.json().catch(() => ({}));
    throw new Error(b.detail || "Request failed");
  }

  return r.json();
}

export type Budget = {
  monthly_income: number;
  rent: number;
  electricity_gas: number;
  water: number;
  council_tax: number;
  internet: number;
  food: number;
  transport: number;
  other_expenses: number;
  deposit: number;
  moving_costs: number;
};

export type PropertyAnalysis = {
  title: string;
  location: string;
  monthly_rent: string;
  listing_text: string;
  landlord_message: string;
};

export const calculate = (data: Budget) =>
  request<any>("/api/affordability/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

export const analyse = (file: File) => {
  const f = new FormData();
  f.append("file", file);

  return request<any>("/api/tenancy/analyse", {
    method: "POST",
    body: f
  });
};

export const properties = () =>
  request<any>("/api/properties/");

export const analyseProperty = (data: PropertyAnalysis) =>
  request<any>("/api/properties/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

export const support = () =>
  request<any>("/api/support/signpost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      uk_nation: "England",
      situation: "private_renter",
      student: true,
      income_pressure: true
    })
  });
