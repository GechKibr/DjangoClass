import React from "react";

function AttachmentList({ attachments }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">Attachments</h3>
      <ul className="space-y-1">
        {attachments.map(a => (
          <li key={a.id}>
            <a
              href={a.file}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {a.file.split("/").pop()}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AttachmentList;
