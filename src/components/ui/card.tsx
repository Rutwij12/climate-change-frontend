import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={`border rounded-lg shadow-sm p-2 ${className}`}>{children}</div>;
}

export function CardContent({ children }: CardProps) {
  return <div className="p-3">{children}</div>;
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={`border-b p-2 ${className}`}>{children}</div>;
}

export function CardTitle({ children }: CardProps) {
  return <h2 className="text-l font-bold">{children}</h2>;
}
