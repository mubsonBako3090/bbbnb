export const downloadBill = async (billId) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/bills/${billId}/download`,
      { method: "GET" }
    );

    if (!response.ok) throw new Error("Failed to download bill.");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bill_${billId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error(error);
    alert("Failed to download bill. Please try again.");
  }
};
