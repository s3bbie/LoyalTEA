// pages/staff/home.js
import { useEffect, useState } from "react";
import { supabase } from "@/utils/authClient";
import { useRouter } from "next/router";
import { useSessionContext } from "@supabase/auth-helpers-react";
import StaffBottomNav from "../../components/StaffBottomNav";
import { Save, Loader2, Upload, Trash2, Plus } from "lucide-react";

export default function StaffHome() {
  const router = useRouter();
  const { session, isLoading } = useSessionContext();
  const [widgets, setWidgets] = useState({});
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🚦 Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !session) router.replace("/staff/login");
  }, [isLoading, session, router]);

  // 🔐 Get staff role
  useEffect(() => {
    async function fetchRole() {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      if (error) console.error("Role fetch error:", error);
      setRole(data?.role || "staff");
    }
    fetchRole();
  }, [session]);

  // 🧩 Load widgets
  useEffect(() => {
    async function loadWidgets() {
      const { data, error } = await supabase.from("user_widgets").select("*");
      if (error) console.error("Widget load error:", error);

      const map = {};
      data?.forEach((w) => (map[w.slot] = w));
      setWidgets(map);
      setLoading(false);
    }
    loadWidgets();
  }, []);

  // 💾 Save widget
  async function updateWidget(slot, updates) {
    setSaving(true);
    const { error } = await supabase
      .from("user_widgets")
      .update(updates)
      .eq("slot", slot);
    if (error) console.error(error);
    else setWidgets((prev) => ({ ...prev, [slot]: { ...prev[slot], ...updates } }));
    setSaving(false);
  }

  // 🗑 Delete widget section
  async function deleteWidget(slot) {
    if (!confirm("Are you sure you want to delete this section?")) return;
    const { error } = await supabase.from("user_widgets").delete().eq("slot", slot);
    if (error) return alert("❌ Delete failed");
    setWidgets((prev) => {
      const copy = { ...prev };
      delete copy[slot];
      return copy;
    });
    alert("✅ Section deleted!");
  }

  // ➕ Recreate widget section
  async function recreateWidget(slot, defaults) {
    const { data, error } = await supabase
      .from("user_widgets")
      .insert([{ slot, ...defaults }])
      .select()
      .single();
    if (error) return alert("Failed to recreate section.");
    setWidgets((prev) => ({ ...prev, [slot]: data }));
  }

  if (loading) return <p className="p-6">Loading editor...</p>;

  const SectionBox = ({ title, slot, children, defaults }) => (
    <section className="bg-white p-6 rounded-2xl shadow mb-8 border">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {widgets[slot] ? (
        <>
          {children}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => deleteWidget(slot)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete Section
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-6">
          <p>This section is currently deleted.</p>
          <button
            onClick={() => recreateWidget(slot, defaults)}
            className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" /> Recreate Section
          </button>
        </div>
      )}
    </section>
  );

  // 🧱 Banner list component
  function BannerList() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function loadBanners() {
        const { data, error } = await supabase
          .from("user_widgets")
          .select("*")
          .eq("slot", "banner")
          .order("created_at", { ascending: false });
        if (error) console.error(error);
        setBanners(data || []);
        setLoading(false);
      }
      loadBanners();
    }, []);

    async function toggleActive(id, current) {
      const { error } = await supabase
        .from("user_widgets")
        .update({ is_active: !current })
        .eq("id", id);
      if (!error)
        setBanners((prev) =>
          prev.map((b) => (b.id === id ? { ...b, is_active: !current } : b))
        );
    }

    async function deleteBanner(id) {
      if (!confirm("Delete this banner?")) return;
      const { error } = await supabase.from("user_widgets").delete().eq("id", id);
      if (!error) setBanners((prev) => prev.filter((b) => b.id !== id));
    }

    if (loading) return <p>Loading banners...</p>;

    return (
      <div className="space-y-4">
        {banners.length === 0 && (
          <p className="text-gray-500 text-center py-4">No banners added yet.</p>
        )}
        {banners.map((b) => (
          <div key={b.id} className="border rounded-lg p-3 bg-gray-50">
            <img
              src={b.image_url}
              alt={b.title}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
            <div className="flex justify-between items-center">
              <button
                onClick={() => toggleActive(b.id, b.is_active)}
                className={`px-3 py-1 rounded-lg text-white ${
                  b.is_active ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
                }`}
              >
                {b.is_active ? "Active" : "Inactive"}
              </button>
              <button
                onClick={() => deleteBanner(b.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 📤 Upload new banner
  async function handleNewBannerUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const path = `uploads/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("user-assets")
      .upload(path, file, { upsert: true });
    if (error) return alert("❌ Upload failed");

    const { data: publicData } = supabase.storage
      .from("user-assets")
      .getPublicUrl(path);

    const { error: insertError } = await supabase.from("user_widgets").insert([
      {
        slot: "banner",
        type: "image",
        image_url: publicData.publicUrl,
        title: "New Banner",
        is_active: true,
      },
    ]);
    if (insertError) alert("❌ Failed to add banner");
    else alert("✅ Banner added!");
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6">🧱 Homepage Editor</h1>

      {/* 🏞️ Banner Manager */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8 border">
        <h2 className="text-xl font-semibold mb-4">🏞️ Banners</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleNewBannerUpload}
          className="mb-4 border p-2 rounded-lg"
        />
        <BannerList />
      </section>

      {/* 📰 Announcement */}
      <SectionBox
        title="📰 Announcement"
        slot="announcement"
        defaults={{ type: "announcement", title: "Announcement", content: "" }}
      >
        <textarea
          value={widgets.announcement?.content || ""}
          onChange={(e) =>
            setWidgets((prev) => ({
              ...prev,
              announcement: { ...prev.announcement, content: e.target.value },
            }))
          }
          className="border rounded-lg p-3 w-full mb-3"
          rows={3}
        />
        <button
          onClick={() =>
            updateWidget("announcement", {
              content: widgets.announcement?.content,
            })
          }
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </SectionBox>

      {/* 💬 Info Box */}
      <SectionBox
        title="💬 Information Box"
        slot="info"
        defaults={{ type: "text", title: "Info", content: "" }}
      >
        <textarea
          value={widgets.info?.content || ""}
          onChange={(e) =>
            setWidgets((prev) => ({
              ...prev,
              info: { ...prev.info, content: e.target.value },
            }))
          }
          className="border rounded-lg p-3 w-full mb-3"
          rows={4}
        />
        <button
          onClick={() => updateWidget("info", { content: widgets.info?.content })}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </SectionBox>

      {/* 🔗 Button Link */}
      <SectionBox
        title="🔗 Button Link"
        slot="button"
        defaults={{ type: "button", title: "View Rewards", link: "/rewards" }}
      >
        <input
          type="text"
          placeholder="Button text"
          value={widgets.button?.title || ""}
          onChange={(e) =>
            setWidgets((prev) => ({
              ...prev,
              button: { ...prev.button, title: e.target.value },
            }))
          }
          className="border rounded-lg p-2 w-full mb-3"
        />
        <input
          type="text"
          placeholder="Button link (e.g. /rewards)"
          value={widgets.button?.link || ""}
          onChange={(e) =>
            setWidgets((prev) => ({
              ...prev,
              button: { ...prev.button, link: e.target.value },
            }))
          }
          className="border rounded-lg p-2 w-full mb-3"
        />
        <button
          onClick={() =>
            updateWidget("button", {
              title: widgets.button?.title,
              link: widgets.button?.link,
            })
          }
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </SectionBox>

      <StaffBottomNav />
    </div>
  );
}
