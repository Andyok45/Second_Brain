import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

export function useContent() {
    const [contents, setContents] = useState<Content[]>([]);

    function refreshContent() {
        axios.get(BACKEND_URL + '/api/v1/content', {
            headers: {
                "Authorization": localStorage.getItem('token')
            }
        }).then((response) => {
          setContents(response.data.content);
        })
    }

    function updateContentPositionLocally(contentId: string, x: number, y: number) {
        setContents((prevContents: any) => {
            return prevContents.map((content: any) => {
                return content._id === contentId ? { ...content, x, y } : content;
            });
        });
    }

    useEffect(() => {
        refreshContent();
        let interval = setInterval(() => {
            refreshContent();
        }, 10*1000);

        return () => {
            clearInterval(interval);
        }

    }, [])

    return {contents, refreshContent, updateContentPositionLocally};
}