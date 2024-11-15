"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBotinfo } from "@/utils/Api";
import React, { useEffect, useState } from "react";

function Page({ params }: { params: { slug: string } }) {
  const [botinfo, setbotinfo] = useState({
    name: "",
    website: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBotinfo(params.slug);
      setbotinfo(data);
    };
    fetchData();
  }, [params?.slug]);

  return (
    <div className="w-full h-[80vh] flex px-1 gap-4">
      {/* Left Side: Form */}
      <div className="flex-1  flex flex-col">
        <div className="">
          <label htmlFor="name" className="text-right">
            Name
          </label>
          <Input
            id="name"
            className="col-span-3"
            value={botinfo.name}
            onChange={(e) =>
              setbotinfo((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div className="">
          <label htmlFor="website" className="text-right">
            Website URL
          </label>
          <Input
            id="website"
            className="col-span-3"
            value={botinfo.website}
            onChange={(e) =>
              setbotinfo((prev) => ({ ...prev, website: e.target.value }))
            }
          />
        </div>
        <div>
          <label htmlFor="website" className="text-right">
            About Bot
          </label>
          <Input
            id="website"
            className="col-span-3"
            value={botinfo.website}
            onChange={(e) =>
              setbotinfo((prev) => ({ ...prev, website: e.target.value }))
            }
          />
        </div>
        <div className="">
          <label htmlFor="upload" className="text-right">
            Upload PDF for Context
          </label>
          <Input
            id="upload"
            type="file"
            accept=".pdf"
            className="col-span-2"
            onChange={(e) =>
              setbotinfo((prev) => ({
                ...prev,
                file: e.target.files?.[0] || null,
              }))
            }
          />
          <Button type="button">Learn</Button>
        </div>
      </div>

      {/* Right Side: Chat UI */}
      <div className="flex-1 border-l pl-4">
        {/* Replace this iframe with your chat component */}
        <iframe
          src={`http://localhost:3000/chatui?botid=${params.slug}`} // Replace with the actual chat UI URL
          className="w-full h-full border-none"
          title="Chat UI"
        />
      </div>
    </div>
  );
}

export default Page;
