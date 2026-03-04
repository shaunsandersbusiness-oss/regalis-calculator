export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] py-10 px-6 border-t border-[#1a1a1a]">
      <div className="max-w-[1400px] mx-auto flex flex-col items-center gap-6">
        <img 
          src="https://cdn.prod.website-files.com/6695980889d8d99cedb29bc7/66c7f601fff376e4c95274b3_Regalis%20Realty%20Main%20Logo%20(1).png" 
          alt="Regalis Realty Media" 
          className="max-w-[200px] w-full h-auto"
        />
        <div className="text-center">
          <p className="text-[#c9a84c] text-[14px] font-medium mb-2">Regalis Realty Media</p>
          <p className="text-[#666666] text-[12px]">All rights reserved 2025</p>
        </div>
      </div>
    </footer>
  );
}
