import "./home.css";
export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full min-h-full">
      {children}
    </div>
  );
}