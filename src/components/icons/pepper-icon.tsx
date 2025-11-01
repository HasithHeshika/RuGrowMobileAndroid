import type { SVGProps } from "react";

export function PepperIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.5 6.5C12.5 6.5 14 3 16 3s3.5 1.5 3.5 3.5-1.5 3.5-3.5 3.5-3.5-1.5-3.5-3.5Z" />
      <path d="M12.5 6.5C14.5 8 16.5 8.5 18 9.5s3 1.5 3 3.5c0 4-3.5 7-7.5 7s-7.5-3-7.5-7c0-2 1.5-2.5 3-3.5s2-1.5 3.5-3Z" />
      <path d="M12 10c-1.5-.5-2.5-1.5-3-2.5" />
    </svg>
  );
}
