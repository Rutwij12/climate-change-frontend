"use client";

import React, { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const SignInComponent = () => {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const profileImage = session?.user?.image || "https://i.sstatic.net/l60Hf.png"; // Fallback to default image if null or undefined

  const closeDropdown = () => setIsDropdownOpen(false); // Function to close dropdown

  return (
    <div className="relative">
      {/* Default image or user profile photo */}
      <div className="flex items-center space-x-4">
        <img
          src={profileImage}
          alt="Profile"
          className="w-8 h-8 rounded-full cursor-pointer"
          onClick={toggleDropdown} // Toggle dropdown on image click
        />

        {/* Dropdown for sign-in or sign-out */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
            {/* Back Button */}
            <button
              onClick={closeDropdown}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 border-b"
            >
              Back
            </button>
            {/* Sign-in or Sign-out Button */}
            {!session ? (
              <button
                onClick={() => signIn("google")}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Sign in with Google
              </button>
            ) : (
              <button
                onClick={() => signOut()}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignInComponent;
