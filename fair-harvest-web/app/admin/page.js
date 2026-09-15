import { redirect } from "next/navigation";

// The admin overview lives at /admin/dashboard; /admin is kept as an entry
// point so existing links and bookmarks continue to work.
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
