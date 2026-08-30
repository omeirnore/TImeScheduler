import { deleteSubjectAction } from "@/lib/actions/subjects";
import { X } from "lucide-react";
import type { Subject } from "@/generated/prisma/client";

export function SubjectsList({ subjects }: { subjects: Subject[] }) {
  if (subjects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No subjects yet. Add one above before building your study plan.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {subjects.map((subject) => (
        <li
          key={subject.id}
          className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-3 pr-1.5 text-sm"
        >
          <span className="text-foreground">{subject.name}</span>
          <span className="text-xs text-muted-foreground">
            {subject.category === "COLLEGE" ? "College" : "Self-study"}
          </span>
          <form action={deleteSubjectAction.bind(null, subject.id)}>
            <button
              type="submit"
              aria-label={`Delete ${subject.name}`}
              className="rounded-full p-1 text-muted-foreground hover:bg-background hover:text-danger"
            >
              <X size={14} />
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
