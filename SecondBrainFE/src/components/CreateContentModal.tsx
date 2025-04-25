import { useRef, useState } from 'react';
import { CrossIcon } from '../icons/CrossIcon';
import { Button } from './Button';
import { Input } from './Input';
import axios from 'axios';
import { BACKEND_URL } from '../config';

enum ContentType {
    twitter = 'twitter',
    youtube = 'youtube',
    article = 'article'
}

// controlled component
export function CreateContentModal({open, onClose, position}: {open: boolean, onClose: () => void, position: {x: number, y: number}}) {
      const titleRef = useRef<HTMLInputElement>();
      const linkRef = useRef<HTMLInputElement>();
      const [type, setType] = useState(ContentType.youtube);

      async function addContent() {
          const title = titleRef.current?.value;
          const link = linkRef.current?.value;


          await axios.post(BACKEND_URL + "/api/v1/content", {
            link,
            title,
            x: position.x,
            y: position.y,
            type
          }, {
            headers: {
              "Authorization": localStorage.getItem('token')
            }
          })
          onClose();
      }

      return <div>
          { open && <div>
            <div className='w-screen h-screen bg-slate-500 fixed top-0 left-0 opacity-60 flex justify-center z-30'>

            </div>
            <div className='w-screen h-screen flex top-0 left-0 flex-col fixed justify-center items-center z-30'>
              <span className='bg-white opacity-100 p-4 rounded-lg'>
                  <div className='flex justify-end m-2'>
                     <div onClick={onClose} className='cursor-pointer'>
                      <CrossIcon />
                     </div>

                  </div>
                  <div>
                      <Input reference={titleRef} placeholder='Title'/>
                      <Input reference={linkRef} placeholder='Link'/>
                  </div>
                  <div className='flex'>
                    <div className='text-lg py-4 pl-2'>Type :</div>
                    <div className='flex gap-2 p-3'>
                        <Button size='sm' text="Youtube" variant={type === ContentType.youtube ? "primary" : "secondary"} onClick={() => {
                          setType(ContentType.youtube);
                      }}/>
                      <Button size='sm' text="Twitter" variant={type === ContentType.twitter ? "primary" : "secondary"} onClick={() => {
                          setType(ContentType.twitter);
                      }}/>
                    </div>

                  </div>
                  <div onClick={addContent} className='m-2'>
                    <Button fullWidth={true} variant="primary" text="Submit" size='md'/>
                  </div>

              </span>
            </div>

            </div> }
      </div>


}

