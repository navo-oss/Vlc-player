// මෙතනට පස්සේ අපි හදන Replit සර්වර් එකේ ලින්ක් එක හරි, Termux එකේ රන් කරනවා නම් 'http://localhost:3000' හරි දෙනවා.
const BACKEND_URL = 'http://localhost:3000'; 

export const addMagnetAndGetFiles = async (magnetLink) => {
  try {
    // සර්වර් එකට Magnet එක යවනවා
    const response = await fetch(`${BACKEND_URL}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ magnet: magnetLink }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.files; // මෙතනින් අපිට ෆයිල් ලිස්ට් එක සහ Play කරන්න ඕන ලින්ක් එනවා
    
  } catch (error) {
    console.error("Error fetching torrent files:", error);
    return null;
  }
};
