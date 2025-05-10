'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function HeaderAuth() {
  const { data: session } = useSession();

  return (
    <>
      {session ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {session.user?.email}
          </span>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn()}
          className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          Giriş Yap
        </button>
      )}
    </>
  );
}
