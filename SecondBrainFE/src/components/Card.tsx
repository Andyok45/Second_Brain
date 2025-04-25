import { BACKEND_URL } from "../config";
import { ShareIcon } from "../icons/ShareIcon";
import { TrashIcon } from "../icons/TrashIcon";
import axios from "axios";
import { useContent } from "../hooks/useContent";
import { PaperClip } from "../icons/PaperClip";

interface CardProps {
  title: string;
  link: string;
  type: "twitter" | "youtube";
  contentId: string,
  userId: string
}

export function Card({ title, link, type, contentId, userId }: CardProps) {
  const { refreshContent } = useContent();

  async function deleteContent() {
    console.log("delete content: ", {contentId, userId});
      await axios.delete(BACKEND_URL + "/api/v1/content", {
        headers: {
          "Authorization": localStorage.getItem('token'),
        },
        data: {
          contentId: contentId,
          userId: userId
        }

    });

    refreshContent();
  }

  return (
    <div>
      <div className=" p-4 bg-white rounded-lg outline-gray-200 min-w-72 max-w-72 border min-h-48 max-h-fit">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="pr-2 text-gray-500">
              <PaperClip />
            </div>
            <div className="text-md">{title}</div>
          </div>
          <div className="flex items-center">
            <div className="pr-2 text-gray-500">
              <a href={link} target="_blank">
                <ShareIcon />
              </a>
            </div>
            <div className="text-gray-500 hover:cursor-pointer" onPointerDown={(e) => {
              e.stopPropagation();
              console.log("delete button clicked");
              deleteContent();
            }}>
              <TrashIcon />
            </div>
          </div>
        </div>
        <div className="pt-4">
          {type === "youtube" ? (
            <iframe
              className="w-full"
              src={link.replace("watch", "embed").replace("?v=", "/")}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          ) : null}
          {/* <iframe className="w-full" src="https://www.youtube.com/embed/a4NJNdHqs_I?si=U9I04QRZ_cIkSOob" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe> */}

          {type === "twitter" ? (
            <blockquote className="twitter-tweet">
              <a href={link.replace("x.com", "twitter.com")}></a>
            </blockquote>
          ) : null}
        </div>

        <div className="pt-2">
          Description
        </div>
      </div>
    </div>
  );
}

{/*<blockquote class="twitter-tweet" data-media-max-width="560"><p lang="en" dir="ltr">Launch on Friday<br> <a href="https://t.co/GaLdsH3day">pic.twitter.com/GaLdsH3day</a></p>&mdash; Elon Musk (@elonmusk) <a href="https://twitter.com/elonmusk/status/1894071293999288421?ref_src=twsrc%5Etfw">February 24, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> */}
