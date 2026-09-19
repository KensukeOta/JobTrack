"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api/api-error";
import { deleteJob } from "@/lib/api/jobs";

type DeleteJobButtonProps = {
  jobId: string;
  companyName: string;
};

export function DeleteJobButton({ jobId, companyName }: DeleteJobButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  function handleOpen() {
    setError(null);
    setIsOpen(true);
  }

  function handleClose() {
    if (isDeleting) {
      return;
    }

    setIsOpen(false);
    setError(null);
  }

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await deleteJob(jobId);

      router.push("/jobs");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          setError(
            "この求人は既に削除されているか、削除する権限がありません。",
          );
        } else if (error.status === 403) {
          setError(
            "セキュリティ情報を確認できませんでした。再ログインしてお試しください。",
          );
        } else {
          setError("求人の削除に失敗しました。もう一度お試しください。");
        }
      } else {
        setError("通信エラーが発生しました。もう一度お試しください。");
      }

      setIsDeleting(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const openButton = openButtonRef.current;

    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();

        if (!isDeleting) {
          setIsOpen(false);
          setError(null);
        }

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      window.requestAnimationFrame(() => {
        openButton?.focus();
      });
    };
  }, [isOpen, isDeleting]);

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        onClick={handleOpen}
        className="inline-flex cursor-pointer rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
      >
        削除
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-job-title"
            aria-describedby="delete-job-description"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2
              id="delete-job-title"
              className="text-lg font-semibold text-slate-900"
            >
              求人を削除しますか？
            </h2>

            <p
              id="delete-job-description"
              className="mt-3 text-sm leading-6 text-slate-600"
            >
              「{companyName}」の求人情報を削除します。
              この操作は取り消せません。
            </p>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={handleClose}
                disabled={isDeleting}
                className="inline-flex cursor-pointer justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                キャンセル
              </button>

              <button
                ref={deleteButtonRef}
                type="button"
                onClick={() => {
                  void handleDelete();
                }}
                disabled={isDeleting}
                className="inline-flex cursor-pointer justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "削除しています..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
