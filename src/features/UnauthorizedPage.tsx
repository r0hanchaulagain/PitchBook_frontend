export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-900 text-white">
      <h1 className="mb-4 text-4xl font-bold">Unauthorized</h1>
      <p>You do not have permission to view this page.</p>
    </div>
  );
}
