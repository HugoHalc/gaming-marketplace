import type { ReactNode, SVGProps } from "react";

type TrustIconProps = SVGProps<SVGSVGElement>;

function IconFrame({
  children,
  ...props
}: TrustIconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function PricingValidationIcon(props: TrustIconProps) {
  return (
    <IconFrame {...props}>
      <path d="M5.5 7.5 9 4h8.5l1 1v5.5" />
      <path d="M5.5 7.5v9L8 19h5.5" />
      <path d="M5.5 7.5H9V4" />
      <path d="M9 9.5h5.5M9 13h3.5" />
      <path d="m14.5 16 1.8 1.8 3.7-4.3" />
    </IconFrame>
  );
}

export function SecurePaymentIcon(props: TrustIconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="6" width="16" height="11.5" rx="2.5" />
      <path d="M4 9.5h16" />
      <path d="M7.5 14h3" />
      <path d="m15.1 13.6 1.25 1.2 2.05-2.35" />
    </IconFrame>
  );
}

export function OrderTrackingIcon(props: TrustIconProps) {
  return (
    <IconFrame {...props}>
      <path d="M6 5.5h8.5l3.5 3.5v9.5H6z" />
      <path d="M14.5 5.5V9H18" />
      <path d="M9 12h6M9 15.5h3.5" />
      <circle cx="6" cy="5.5" r="1.5" />
      <circle cx="18" cy="18.5" r="1.5" />
    </IconFrame>
  );
}

export function AccountAccessIcon(props: TrustIconProps) {
  return (
    <IconFrame {...props}>
      <path d="M5.5 8.5 9 5h6l3.5 3.5v8L15 20H9l-3.5-3.5z" />
      <circle cx="12" cy="11" r="2" />
      <path d="M12 13v3" />
      <path d="M9 5v3.5H5.5" />
    </IconFrame>
  );
}

export function OrderCommunicationIcon(props: TrustIconProps) {
  return (
    <IconFrame {...props}>
      <path d="M5 6.5h11.5A2.5 2.5 0 0 1 19 9v4a2.5 2.5 0 0 1-2.5 2.5H11L7.5 19v-3.5H5A2 2 0 0 1 3 13.5v-5a2 2 0 0 1 2-2Z" />
      <path d="M7.5 10h7M7.5 12.8h4.5" />
      <path d="M16.5 6.5V4.5H19" />
    </IconFrame>
  );
}

export function SiteSupportIcon(props: TrustIconProps) {
  return (
    <IconFrame {...props}>
      <path d="M5 12a7 7 0 0 1 14 0" />
      <path d="M5 12v4a2 2 0 0 0 2 2h1v-6H5Z" />
      <path d="M19 12v4a2 2 0 0 1-2 2h-1v-6h3Z" />
      <path d="M16 18c0 1.1-.9 2-2 2h-2" />
      <path d="M9 5.8 11 4h4" />
    </IconFrame>
  );
}

export const trustIconByTitle = {
  "Server-validated pricing": PricingValidationIcon,
  "Payment through Stripe": SecurePaymentIcon,
  "Dashboard order tracking": OrderTrackingIcon,
  "Account access after checkout": AccountAccessIcon,
  "Order communication": OrderCommunicationIcon,
  "Site support": SiteSupportIcon,
} as const;
