"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BotInput } from "@/types";
import { createBot, getBotlist, learnapi } from "@/utils/Api";
import React, { useEffect, useState } from "react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
function Page() {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [botList, setBotlist] = useState<any>([]);
  const [source, setSource] = useState<any>([]);
  const [show, setShow] = useState(false);
  const [botinfo, setbotinfo] = useState<BotInput>({
    file: null,
    name: "",
    website: "",
    topic: "",
  });

  const handleCreate = async () => {
    // await createBot(botinfo);
    // console.log(botinfo);

    console.log(source);
    // setOpenDialog(false);
  };

  const handleLearn = async () => {
    if (botinfo.file) {
      const data = await learnapi(botinfo.file);
      setbotinfo((prev) => ({ ...prev, source: data }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBotlist();
      setBotlist(data.data?.botInfo);
      setSource(data?.data?.sourceInfo);
    };

    fetchData();
  }, []);

  return (
    <div className="w-full px-3 py-3">
      <div className="flex justify-between items-center">
        <h1 className="text-primary text-2xl font-bold">Bots</h1>
        <Button
          className="hover:bg-secondary hover:text-primary"
          onClick={() => setOpenDialog(true)}
        >
          Create Bot
        </Button>
      </div>
      {botList && botList.length > 0 ? (
        <div className="w-full grid grid-cols-3 gap-4 mt-2">
          {botList.map((item: any) => (
            <Card key={item.botid} className="p-4 shadow">
              <CardContent className="flex flex-col items-start">
                <div className="w-full">
                  <div
                    className="w-full flex justify-end"
                    onClick={() => router.push(`/dashboard/bot/${item.botid}`)}
                  >
                    <div className="w-5 h-5 flex justify-center items-center bg-white text-black rounded-md hover:bg-black hover:text-white cursor-pointer">
                      <Pencil1Icon />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.website}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-4">No Bot</div>
      )}

      <Dialog open={openDialog} onOpenChange={() => setOpenDialog(false)}>
        <DialogContent className="sm:max-w-[50%]">
          <DialogHeader>
            <DialogTitle>Create Bot!</DialogTitle>
            <DialogDescription>Set Up Your Bot Info Here..</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                className="col-span-3"
                onChange={(e) =>
                  setbotinfo((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="Url" className="text-right">
                Website URL
              </label>
              <Input
                id="Url"
                className="col-span-3"
                onChange={(e) =>
                  setbotinfo((prev) => ({ ...prev, website: e.target.value }))
                }
              />
            </div>

            {source.length > 0 && show ? (
              <div className="grid grid-cols-6 items-center gap-4">
                <label htmlFor="sourceSelect" className="text-right">
                  Select Existing Source
                </label>
                <select
                  id="sourceSelect"
                  className="col-span-4 border rounded-md p-2"
                  onChange={(e) =>
                    setbotinfo((prev) => ({
                      ...prev,
                      selectedSource: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Select Source --</option>
                  {source.map((src: any) => (
                    <option key={src.sourceid} value={src.sourceid}>
                      {src.documentname}
                    </option>
                  ))}
                </select>
                <Button onClick={() => setShow(true)}>Upload New</Button>
              </div>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="fileUpload" className="text-right">
                  Upload PDF for Context
                </label>
                <Input
                  id="fileUpload"
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
                <Button type="button" onClick={handleLearn}>
                  Learn
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreate}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Page;
