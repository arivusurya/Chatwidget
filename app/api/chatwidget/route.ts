import { NextResponse } from "next/server";

export async function GET() {
  console
  const headers = new Headers({
    "Content-Type": "application/javascript",
    "Cache-Control": "public, max-age=31536000, immutable",
  });

  // Widget JavaScript code as a string
  const widgetCode = `
    (function() {
      // Create the widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.id = 'chat-widget-container';
      document.body.appendChild(widgetContainer);

      // Create the chat button
      const chatButton = document.createElement('button');
      chatButton.innerText = 'Chat with Us!';
      chatButton.style = 'position: fixed; bottom: 20px; right: 20px; padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; z-index: 1000;';
      widgetContainer.appendChild(chatButton);

      // Function to render chat box with iframe
      function renderChatBox() {
        // Prevent multiple chat boxes from being created
        if (document.getElementById('chat-box')) return;

        const chatBox = document.createElement('div');
        chatBox.id = 'chat-box';
        chatBox.style = 'position: fixed; bottom: 80px; right: 20px; width:400px ; height: 80%; background-color: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); overflow: hidden; z-index: 1000;';

        // Add a close button inside chat box
        const closeButton = document.createElement('button');
        closeButton.innerText = 'Close';
        closeButton.style = 'position: absolute; top: 10px; right: 10px; background: transparent; border: none; cursor: pointer; color: #999;';
        closeButton.onclick = function() {
          chatBox.remove();
        };
        chatBox.appendChild(closeButton);

        // Add iframe for the chat page
        const chatIframe = document.createElement('iframe');
        chatIframe.src = "http://localhost:3000/chatui?botid=1b1975ca-c288-4b16-a77c-3994a82e9cc3"; // Replace with the actual URL of your frontend chat page
        chatIframe.style = 'width: 100%; height: calc(100% - 40px); border: none;'; // Adjust height for close button
        chatBox.appendChild(chatIframe);

        // Append chat box to widget container
        widgetContainer.appendChild(chatBox);
      }

      // Event listener for button click
      chatButton.onclick = function() {
        renderChatBox();
      };
    })();
  `;

  return new NextResponse(widgetCode, { status: 200, headers });
}
