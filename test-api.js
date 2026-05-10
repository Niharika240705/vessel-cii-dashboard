async function main() {
  const res = await fetch(`http://127.0.0.1:3000/api/vessels/d567714e-5873-41b3-9489-ef806b77b7ba/cii-trajectory`);
  console.log(res.status);
  const data = await res.text();
  console.log(data.substring(0, 500));
}
main().catch(console.error);
