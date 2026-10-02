import { Box } from "@/components/ui/box";
import { Icon } from "@/components/ui/icon";
import Image from "next/image";
// import React, { useState } from "react";
import im1 from "./assets/carengine.png";
import ArrowDownActiveIMG from "./assets/icons/arrow_down.png";
import ArrowUpActiveIMG from "./assets/icons/arrow_up.png";
import L2CategorySection from "./l2-l3-category-block";
import { PartsCategoryInterface } from "@/types/categories";

type Props = {};

const NewCategoryAdvTile = (props: {
  expanded?: boolean;
  handleExpand: any;
  id: string;
  parentId: string;
  title: string;
  description?: string;
  subcategories?: object[];
}) => {
  const {
    id,
    parentId,
    expanded,
    title,
    description = `Sagittis, eu pretium massa quisque cursus augue massa cursus. Sed quisque velit, auctor
            at lobortis hac tincidunt sodales id.`,
    subcategories,
    handleExpand,
  } = props;
  // const [L1Expanded, setL1Expanded] = useState(expanded);
  const handleClick = () => {
    if (handleExpand) {
      handleExpand({
        id,
        parentId,
        // expanded: !L1Expanded,
      });
    }
    // setL1Expanded(!L1Expanded);
  };

  // return (<div className="columns-2 gap-6">
  //           <div className="mb-6 break-inside-avoid">Card 1</div>
  //           <div className="mb-6 break-inside-avoid">Card 2</div>
  //           <div className="mb-6 break-inside-avoid">Tall Card</div>
  //           <div className="mb-6 break-inside-avoid">Card 5</div>
  //           <div className="mb-6 break-inside-avoid">Card 6</div>
  //         </div>
  //         );

  return (
    <Box className="min-h-6 break-inside-avoid">
      <Box
        className={`cursor-pointer flex-row items-start justify-start overflow-hidden ${expanded ? "rounded-t-lg" : "rounded-lg"} bg-white shadow-[0px_2px_6px_0px_rgba(0,0,0,0.22)]`}
        onClick={handleClick}
      >
        <Box className="flex min-w-[150px] items-center justify-start overflow-hidden md:min-w-[188px]">
          <Box className="relative h-[150px] w-full justify-center overflow-hidden bg-gradient-to-bl from-green-700 to-emerald-900 md:h-[187px]">
            <Image
              height={173}
              width={138}
              alt={title}
              className="w-full self-center"
              // className="absolute left-[7px] top-[34px] h-36 w-44"
              src={im1}
            />
          </Box>
        </Box>

        <Box className="h-full w-full px-[24px] pt-[24px]">
          <Box className="h-full w-full">
            <Box className="">
              <Box className="justify-center font-Overpass text-xs font-bold uppercase text-gray-700">
                CATEGORY
              </Box>
              <Box className="justify-center pb-[4px] font-Overpass text-lg font-bold leading-relaxed text-slate-950 md:pb-[20px] md:text-2xl">
                {title}
              </Box>
              <Box className="h-11 w-auto justify-center overflow-hidden text-clip font-Overpass text-sm font-normal text-gray-700">
                {description}
              </Box>
            </Box>
          </Box>
          <Box className="absolute right-[24px] top-[22px] h-6 w-6">
            {/* <Box className="absolute left-[6px] top-[9px] h-1.5 w-3 outline outline-[1.50px] outline-offset-[-0.75px] outline-green-950" /> */}
            {/* <ChevronDownIcon /> */}
            {expanded && (
              <Icon as={() => <Image src={ArrowUpActiveIMG} alt="Arrow Up" />} className="ml-2" />
            )}
            {!expanded && (
              <Icon
                as={() => <Image src={ArrowDownActiveIMG} alt="Arrow Down" />}
                className="ml-2"
              />
            )}

            {/* <Icon as={ChevronDownIcon} className="h-1.5 w-3 absolute left-[6px] top-[9px] " /> */}
          </Box>
        </Box>
      </Box>

      {expanded && (
        <L2CategorySection
          id={id}
          parentId={parentId}
          categories={subcategories as PartsCategoryInterface[]}
          level={2}
          title=""
          data={null}
        />
      )}
    </Box>
  );
};

export default NewCategoryAdvTile;
