"use client";

export default function RetryButton() {
  return (
    <button
      type="button"
      className="btn-primary inline-flex"
      onClick={() => window.location.reload()}
    >
      다시 시도하기
    </button>
  );
}
