function getRandomID() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
export function getUserId(): string {
  let userId = localStorage.getItem("kodewords-userId");
  if (!userId) {
    const randomUUID = getRandomID();
    localStorage.setItem("kodewords-userId", randomUUID);
    userId = randomUUID;
  }
  return userId;
}
