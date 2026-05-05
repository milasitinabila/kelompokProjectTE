export const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
};

export const formatShortDate = (dateString: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(dateString));
};

export const formatTime = (dateString: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    timeStyle: "short",
  }).format(new Date(dateString));
};

export const translateServiceType = (type: string) => {
  const map: Record<string, string> = {
    hitachi: "Hitachi",
    electrolux: "Electrolux",
  };
  return map[type] || type;
};

export const translatePaymentMethod = (method: string) => {
  const map: Record<string, string> = {
    tunai: "Tunai",
    qris: "QRIS",
    transfer: "Transfer Bank",
    kartu: "Kartu",
    cicilan: "Cicilan",
  };
  return map[method] || method;
};
