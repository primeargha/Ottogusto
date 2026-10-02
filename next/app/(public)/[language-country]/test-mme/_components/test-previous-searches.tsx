"use client";

import React from "react";
import { useMmeStore } from "@/stores/useMmeStore";

export default function TestPreviousSearches() {
  const { previousSearches, clearPreviousSearches } = useMmeStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Previous Searches (MME Store)</h3>
        {previousSearches.length > 0 && (
          <button
            onClick={clearPreviousSearches}
            className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
          >
            Clear All
          </button>
        )}
      </div>

      {previousSearches.length === 0 ? (
        <div className="rounded-lg border bg-gray-50 p-4 text-gray-500">
          No previous searches found
        </div>
      ) : (
        <div className="space-y-3">
          {previousSearches?.map((search, index) => (
            <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold text-blue-600">{search.title}</h4>
                <span className="text-xs text-gray-500">
                  {new Date(search.timeAgo).toLocaleString()}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Make:</span> {search.make}
                </div>
                <div>
                  <span className="font-medium">Model:</span> {search.model}
                </div>
                <div>
                  <span className="font-medium">Engine:</span> {search.engine}
                </div>
                {search.makeModelTypeId && (
                  <div>
                    <span className="font-medium">ID:</span> {search.makeModelTypeId}
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                <strong>MME Data:</strong> {JSON.stringify(search.mmytData, null, 2)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border bg-yellow-50 p-4">
        <h4 className="mb-2 font-semibold text-yellow-800">Debug Info:</h4>
        <div className="text-xs">
          <div>Total searches: {previousSearches.length}</div>
          <div>Raw data: {JSON.stringify(previousSearches, null, 2)}</div>
        </div>
      </div>
    </div>
  );
}
