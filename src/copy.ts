export default function copy(data: string) {
  try {
    return navigator.clipboard.writeText(data);
  } catch (error) {
    console.error(error);
    alert("Unable to copy codes! You may have to manually copy them.");
  }
}
