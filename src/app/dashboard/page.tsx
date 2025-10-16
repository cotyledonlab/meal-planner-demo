import { redirect } from 'next/navigation';

import { auth, signOut } from '~/server/auth';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {session.user.email ?? session.user.name ?? 'User'}
              </span>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button
                  type="submit"
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {session.user.name ?? session.user.email}!
          </h2>
          <p className="mt-4 text-gray-600">
            This is a protected page. Only authenticated users can see this content.
          </p>

          <div className="mt-6 rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">Session Information</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-inside list-disc space-y-1">
                    <li>User ID: {session.user.id}</li>
                    <li>Email: {session.user.email}</li>
                    {session.user.name && <li>Name: {session.user.name}</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
