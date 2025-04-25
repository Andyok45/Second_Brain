import '../App.css'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { PlusIcon } from '../icons/PlusIcon'
import { ShareIcon } from '../icons/ShareIcon'
import { CreateContentModal } from '../components/CreateContentModal'
import { useEffect, useRef, useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { useContent } from '../hooks/useContent'
import axios from 'axios'
import { BACKEND_URL } from '../config'
// import Draggable from 'react-draggable'
// import { data } from 'react-router-dom'
import { DndContext, useDraggable } from '@dnd-kit/core'
import { BarsMenu } from '../icons/BarsMenu'

// Debounce utility function
function debounce(func: any, wait: any) {
  let timeout: any;
  return function(...args: any) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

export function DraggableCard({
  type,
  title,
  link,
  x,
  y,
  userId,
  _id,
  canvasZoom
}: {
  title: string,
  link: string,
  type: "youtube" | "twitter",
  x: number,
  y: number,
  userId: any,
  _id: string,
  canvasZoom: number
}) {
  // Keep track of both the base position and any drag offset
  // const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);

  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: _id,
    data: {
      userId,
      x,
      y
    }
  });

  // // Update local position when initial props change and we're not dragging
  // useEffect(() => {
  //   if (!isDragging) {
  //     setPosition({ x: initialX, y: initialY });
  //   }
  // }, [initialX, initialY, isDragging]);

  // Listen for drag state changes
  useEffect(() => {
    if (transform) {
      setIsDragging(true);
    } else {
      // Small delay to ensure we don't reset isDragging too early
      const timeout = setTimeout(() => setIsDragging(false), 50);
      return () => clearTimeout(timeout);
    }
  }, [transform]);

  const style = {
    position: 'absolute' as const,
    left: `${x}px`,
    top: `${y}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
    transform: transform ? `translate3d(${transform.x / canvasZoom}px, ${transform.y / canvasZoom}px, 0)` : undefined,
    touchAction: 'none',
    transition: isDragging ? 'none' : 'transform 0.1s ease',
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      data-draggable-id={_id}
      onClick={(e) => e.stopPropagation()}
    >
      <Card userId={userId} contentId={_id} type={type} title={title} link={link} />
    </div>
  );
}


function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false)
  const [SidebarOpen, setSidebarOpen] = useState(false)
  const [hasMoved, setHasMoved] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [canvasPosition, setCanvasPosition] = useState({x: 0, y: 0});
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [position, setPosition] = useState({x: 0, y: 0});
  const [startDragPos, setStartDragPos] = useState({x: 0, y: 0});
  const [selectedPosition, setSelectedPosition] = useState({x: 0, y: 0});
  const canvasInitialised = useRef(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {contents, refreshContent, updateContentPositionLocally} = useContent();
  const pendingUpdatesRef = useRef({});

  useEffect(() => {
    refreshContent();
  }, [modalOpen, refreshContent]);

  useEffect(() => {
    if(containerRef.current && !canvasInitialised.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      setCanvasPosition({
        x: containerWidth / 2 - 10000,
        y: containerHeight / 2 - 10000
      });

      canvasInitialised.current = true;
    }
  })

  // Create a debounced position update function
  const debouncedUpdatePosition = useRef(
    debounce(async (contentId: string, userId: any, x: any, y: any) => {
      try {
        await axios.patch(`${BACKEND_URL}/api/v1/content`, {
          contentId,
          userId,
          x,
          y
        }, {
          headers: {
            "Authorization": localStorage.getItem('token')
          }
        });

        // Remove from pending updates
        const { [contentId]: removed, ...rest } = pendingUpdatesRef.current;
        pendingUpdatesRef.current = rest;

        // refreshContent();
      } catch (error) {
        console.error('Failed to update position:', error);
        refreshContent();
      }
    }, 1000) // 500ms debounce time
  ).current;

  const handleDragEnd = async (event: any) => {
    const {active, delta} = event;
    const {x, y} = delta;
    const {id, data} = active;

    // Calculate the actual position considering zoom
    const newPosition = {
      x: data.current.x + (x / zoom),
      y: data.current.y + (y / zoom)
    };

    updateContentPositionLocally(id, newPosition.x, newPosition.y);

    // Find the dragged card element
    // const cardElement = document.querySelector(`[data-draggable-id="${id}"]`) as HTMLElement;
    // if (cardElement) {
    //   // update the position directly on the element
    //   cardElement.style.left = `${newPosition.x}px`;
    //   cardElement.style.top = `${newPosition.y}px`;
    // }

    // Store latest position in pending updates
    pendingUpdatesRef.current[id] = {
      userId: data.current.userId,
      x: newPosition.x,
      y: newPosition.y
    };

    // Trigger debounced update
    debouncedUpdatePosition(id, data.current.userId, newPosition.x, newPosition.y);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only start canvas panning if clicking on the canvas itself and not on a card
    e.stopPropagation();

    const target = e.target as HTMLElement;
    if (target === canvasRef.current || target === containerRef.current || target.classList.contains('canvas') || target.classList.contains('canvas-container')) {
      setIsDraggingCanvas(true);
      setHasMoved(false);
      setStartDragPos({x: e.clientX, y: e.clientY});

      if(containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
      }

      e.preventDefault(); // Prevent text selection during drag
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if(isDraggingCanvas) {
      const deltaX = e.clientX - startDragPos.x;
      const deltaY = e.clientY - startDragPos.y;

      if(Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        setHasMoved(true);
      }

      setCanvasPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))

      setStartDragPos({x: e.clientX, y: e.clientY});
    }
  };

  const handleCanvasMouseUp = () => {
    if(isDraggingCanvas) {
      setIsDraggingCanvas(false);

      if(containerRef.current) {
        containerRef.current.style.cursor = 'grab';
    }
  }
}

  // Handle zooming with mouse wheel
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    // Calculate mouse position relative to canvas
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate zoom factor (adjust sensitivity as needed)
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1; // Zoom out or in
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor)); // Limit zoom range

    // Adjust position to zoom toward mouse position
    const newPosition = {
      x: mouseX - (mouseX - canvasPosition.x) * (newZoom / zoom),
      y: mouseY - (mouseY - canvasPosition.y) * (newZoom / zoom)
    };

    setZoom(newZoom);
    setCanvasPosition(newPosition);
  };

  // Set up wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const wheelHandler = (e: WheelEvent) => handleWheel(e);
      container.addEventListener('wheel', wheelHandler, { passive: false });

      return () => {
        container.removeEventListener('wheel', wheelHandler);
      };
    }
  }, [zoom, canvasPosition]);



   // Handle clicking on canvas to add new content - Fixed
   const handleCanvasClick = (e: React.MouseEvent) => {

    if(hasMoved) {
      // Don't add new content if the canvas was moved
      return;
    }
    // Check if we're clicking on a card (which has higher z-index)
    const target = e.target as HTMLElement;
    const isCardOrCardChild = target.closest('[data-draggable-id]');

    if (isCardOrCardChild) {
      // Click was on a card, don't add new content
      return;
    }

    // Get mouse position relative to container
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate the actual position on the canvas, considering zoom and pan
    const canvasX = (e.clientX - rect.left - canvasPosition.x) / zoom;
    const canvasY = (e.clientY - rect.top - canvasPosition.y) / zoom;

    console.log("Canvas Click Position:", canvasX, canvasY);

    // Open modal to add content
    setSelectedPosition({ x: canvasX, y: canvasY });
    setModalOpen(true);
  };



  return <div>

      {/* <Sidebar/> */}
      <CreateContentModal position={selectedPosition} open={modalOpen} onClose={()   => {
                                      setModalOpen(false);
                              }}/>

                                <div className= "flex justify-between gap-4 mb-2 w-fit fixed top-0 z-20 p-4">
                                      <Button onClick={() => {
                                          setSidebarOpen(!SidebarOpen);
                                    }} startIcon={<BarsMenu />} size='md' variant='primary' text=''/>
                                </div>
                                <div className='flex gap-4 top-0 right-0 z-20 p-4 w-fit fixed'>
                                      <Button onClick={() => {
                                          setModalOpen(true);
                                    }} startIcon={<PlusIcon />} size='md' variant='primary' text='Add Content'/>
                                    <Button onClick={async() => {
                                    const response = await axios.post(`${BACKEND_URL}/api/v1/brain/share`, {
                                    share: true
                                    }, {
                                      headers: {
                                        "Authorization": localStorage.getItem('token')
                                      }
                                    });
                                    const shareUrl = `http://localhost:5173/share/${response.data.hash}`;
                                    alert(shareUrl);
                                    }}  startIcon={<ShareIcon/>} size='md' variant='secondary' text='Share Brain'/>
                                </div>




                              <div className="flex pt-16 fixed z-20"> {/* Add margin-top to account for fixed navbar */}
                              {/* Sidebar */}
                              <div className={`fixed left-0 top-16 h-fit w-72 z-20 transition-transform duration-300 ${SidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                                <Sidebar open={SidebarOpen} />
                              </div>
                              </div>



                      {/* Zoom controls */}
      <div className="fixed bottom-4 left-4 z-30 flex gap-2 items-center bg-white p-2 rounded-md shadow-md">
        <button
          onClick={() => setZoom(prev => Math.min(5, prev * 1.2))}
          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
        >
          +
        </button>
        <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}
          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
        >
          -
        </button>
        <button
          onClick={() => {
            setZoom(1);

            // Reset to center of canvas
            if (containerRef.current) {
              const containerWidth = containerRef.current.clientWidth;
              const containerHeight = containerRef.current.clientHeight;

              setCanvasPosition({
                x: containerWidth / 2 - 10000,
                y: containerHeight / 2 - 10000,
              });
            }
          }}
          className="ml-2 px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          Reset
        </button>
      </div>


    {/* Infinite canvas container */}
    <div
        ref={containerRef}
        className="canvas-container w-screen h-screen overflow-hidden"
        style={{
          cursor: isDraggingCanvas ? 'grabbing' : 'grab',
          position: 'relative',
          backgroundColor: '#f8f9fa'
        }}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      >
        {/* Canvas element that transforms with zoom and pan */}
        <div
          ref={canvasRef}
          className="canvas"
          style={{
            width: '20000px', // Very large to simulate "infinite"
            height: '20000px',
            position: 'absolute',
            left: '0',
            top: '0',
            transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            background: 'radial-gradient(circle, transparent 0%, transparent 80%, rgba(200,200,200,0.2) 100%), linear-gradient(to right, rgba(200,200,200,0.1) 1px, transparent 1px) 0 0 / 50px 50px, linear-gradient(to bottom, rgba(200,200,200,0.1) 1px, transparent 1px) 0 0 / 50px 50px',
          }}
        >
          {/* Center marker (for debugging, can be removed) */}
          <div style={{
            position: 'absolute',
            left: '10000px',
            top: '10000px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,0,0,0.5)',
            transform: 'translate(-50%, -50%)',
            zIndex: 5
          }} />

          {/* DndContext for handling card dragging */}
          <DndContext onDragEnd={handleDragEnd}>
            {contents.map(({type, title, link, x, y, userId, _id}) => (
              <DraggableCard
                key={_id}
                _id={_id}
                userId={userId}
                type={type}
                title={title}
                link={link}
                x={x}
                y={y}
                canvasZoom={zoom}
              />
            ))}
          </DndContext>
        </div>
      </div>
    </div>



}

export default Dashboard


// export function DraggableCard({type, title, link, x: initialX, y: initialY, userId, _id}: {title: string, link: string, type: "youtube" | "twitter" , x: number, y: number, userId: any, _id: string}) {
//   const [ basePosition , setBasePosition ] = useState({x: initialX, y: initialY});
//   const [ dragOffset, setDragOffset ] = useState({x: 0, y: 0});
//   const [isDragging, setIsDragging] = useState(false);

//   const {attributes, listeners, setNodeRef, transform} = useDraggable({ id : _id, data: {userId, basePosition , dragOffset} });

//   useEffect(() => {
//     setBasePosition({x: initialX, y: initialY});
//   }, [initialX, initialY]);

//   return (
//     <div
//       ref = {setNodeRef}
//       {...attributes}
//       {...listeners}
//       className="absolute"
//       style={{
//         left: `${basePosition.x + dragOffset.x}px`,
//         top: `${basePosition.y + dragOffset.y}px`,
//         cursor: "grab",
//         transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
//         touchAction: 'none',

//       }}

//     >
//       <Card userId={userId} contentId={_id} type={type} title={title} link={link} />
//     </div>
//   )
// }

  // Handle zoom with mouse wheel
  // const handleWheel = (e: any) => {
  //   e.preventDefault();
  //   const newZoom = e.deltaY < 0 ? zoom * 1.1 : zoom / 1.1;
  //   setZoom(Math.min(Math.max(0.1, newZoom), 5));
  // };

  // // Start dragging the canvas
  // const handleMouseDown = (e: any) => {
  //   if (e.target === e.currentTarget) {
  //     setIsDragging(true);
  //     setDragStart({
  //       x: e.clientX - position.x,
  //       y: e.clientY - position.y
  //     });
  //   }
  // };

  // // Update canvas position while dragging
  // const handleMouseMove = (e: any) => {
  //   if (isDragging) {
  //     setPosition({
  //       x: e.clientX - dragStart.x,
  //       y: e.clientY - dragStart.y
  //     });
  //   }
  // };

  // const handleMouseDownDrag = (contentId: any) => {
  //   setDraggedElement(contentId);
  // }

  // const handleMouseUpDrag = async (e: any, data: any, _id: string, userId: string) => {
  //   await axios.patch(`${BACKEND_URL}/api/v1/content`, {
  //     contentId: _id,
  //     userId: userId,
  //     x: data.x,
  //     y: data.y
  //   }, {
  //     headers: {
  //       "Authorization": localStorage.getItem('token')
  //     }
  //   });
  // }

// import '../App.css'
// import { Button } from '../components/Button'
// import { Card } from '../components/Card'
// import { PlusIcon } from '../icons/PlusIcon'
// import { ShareIcon } from '../icons/ShareIcon'
// import { CreateContentModal } from '../components/CreateContentModal'
// import { useEffect, useRef, useState } from 'react'
// import { Sidebar } from '../components/Sidebar'
// import { useContent } from '../hooks/useContent'
// import axios from 'axios'
// import { BACKEND_URL } from '../config'
// import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'


// function Dashboard() {
//   const canvasSize = 50000;
//   const [modalOpen, setModalOpen] = useState(false)
//   const {contents, refreshContent} = useContent();
//   const wrapperRef = useRef(null);
//   const [isMounted, setIsMounted] = useState(false); // Track if component is mounted


//   useEffect(() => {
//     setIsMounted(true); // Set to true after the initial render
//   }, []);

//   useEffect(() => {
//     if (isMounted && wrapperRef.current) {
//       // Use requestAnimationFrame to ensure the component is fully rendered
//       requestAnimationFrame(() => {
//         wrapperRef.current?.setTransform(
//           -canvasSize / 2 + window.innerWidth / 2,
//           -canvasSize / 2 + window.innerHeight / 2,
//           1,
//           0,
//           'easeOut'
//         );
//       });
//     }
//   }, [isMounted, window.innerWidth, window.innerHeight]); // Listen for window resize



//   useEffect(() => {
//     refreshContent();
//   }, [modalOpen]);

//   return <div>
//       {/* <Sidebar/> */}
//       <CreateContentModal open={modalOpen} onClose={()   => {
//                                       setModalOpen(false);
//                               }}/>
//                               <div className= "flex justify-end gap-4 mb-2 w-fit fixed top-0 right-0 z-20 p-4">
//                                 <Button onClick={() => {
//                                       setModalOpen(true);
//                                 }} startIcon={<PlusIcon />} size='md' variant='primary' text='Add Content'/>
//                                 <Button onClick={async() => {
//                                 const response = await axios.post(`${BACKEND_URL}/api/v1/brain/share`, {
//                                 share: true
//                                 }, {
//                                   headers: {
//                                     "Authorization": localStorage.getItem('token')
//                                   }
//                                 });
//                                 const shareUrl = `http://localhost:5173/share/${response.data.hash}`;
//                                 alert(shareUrl);
//                                 }}  startIcon={<ShareIcon/>} size='md' variant='secondary' text='Share Brain'/>
//                       </div>


//     <div className='w-screen h-screen overflow-hidden'>
//         <TransformWrapper
//           ref={wrapperRef}
//           initialScale={1}
//           minScale={0.2}
//           maxScale={5}
//           limitToBounds={false}
//           centerOnInit={true}
//         >
//           {() => (
//             <>

//               <TransformComponent>
//                 <div style={{width: `${canvasSize}px`, height: `${canvasSize}px`}} className='flex items-center justify-center' >



//                         <div style={{justifyContent: 'center', alignItems: 'center'}} className='flex gap-4' >
//                             {contents.map(({type, title, link}) => <Card type={type} title={title} link={link} />)}
//                         </div>
//                 </div>
//               </TransformComponent>
//             </>
//           )}

//         </TransformWrapper>

//     </div>
//   </div>



// }

// export default Dashboard


