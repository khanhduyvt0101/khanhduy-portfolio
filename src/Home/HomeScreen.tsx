import Image from "next/image";
import menuImage from "@/images/btn_menu.svg";
import helloImage from "@/images/Hello-Im.svg";
import downCVImage from "@/images/buttonDownCV.svg";
import iphoneImage from "@/images/iphone.png";
import githubImage from "@/images/github.png";
import linkedinImage from "@/images/linkedin.png";
import facebookImage from "@/images/facebook.png";
import avatarImage from "@/images/avatar.jpeg";
import { Avatar } from "@mui/material";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import Button from "@mui/material/Button";
import React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export const HomeScreen = () => {
  return (
    <div className="h-screen bg-[#27323E]">
      <div className="flex flex-row items-center justify-between px-10 pt-10">
        <div className="flex flex-row">
          <span className="text-white text-4xl">Khanh Duy</span>
          <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 pl-2">
            Portfolio
          </span>
        </div>

        <div className="flex h-20 w-20 items-center justify-center">
          <PopupState variant="popover" popupId="">
            {(popupState) => (
              <div className="mr-20">
                <Button
                  className="p-0"
                  startIcon={
                    <Image className="bg-cover" src={menuImage} alt={""} />
                  }
                  variant="text"
                  {...bindTrigger(popupState)}
                />
                <Menu
                  className="items-start justify-start"
                  {...bindMenu(popupState)}
                >
                  <MenuItem
                    className="justify-center items-center"
                    onClick={popupState.close}
                  >
                    <span className="justify-center text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 pl-2">
                      Profile
                    </span>
                  </MenuItem>
                  <MenuItem
                    className="justify-center"
                    onClick={popupState.close}
                  >
                    <span className="justify-center text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 pl-2">
                      Project
                    </span>
                  </MenuItem>
                  <MenuItem
                    className="justify-center"
                    onClick={popupState.close}
                  >
                    <span className="justify-center text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 pl-2">
                      Contact
                    </span>
                  </MenuItem>
                </Menu>
              </div>
            )}
          </PopupState>
        </div>
      </div>
      <div className="flex justify-evenly items-center flex-row pt-32">
        <div className="flex-col flex justify-start items-start">
          <div className="flex items-center h-30 w-30 justify-center">
            <p className="absolute text-center text-white text-2xl">{`Hello, i'm`}</p>
            <Image className="bg-cover" src={helloImage} alt={""} />
          </div>
          <span className="text-white text-8xl py-5">Khanh Duy</span>
          <span className="text-white text-2xl pb-5 w-full">
            FULL-STACK DEVELOPER | MOBILE DEVELOPER | FREELANCER
          </span>
          <div className="flex flex-row pb-5 justify-start items-center">
            <button
              onClick={() =>
                window.open("https://github.com/khanhduyvt0101", "_blank")
              }
              className="w-10 h-10"
            >
              <Image className="bg-cover" src={githubImage} alt="" />
            </button>
            <button
              onClick={() =>
                window.open(
                  "https://www.linkedin.com/in/buitrongkhanhduy/",
                  "_blank"
                )
              }
              className="w-10 h-10 ml-4"
            >
              <Image className="bg-cover" src={linkedinImage} alt={""} />
            </button>
            <button
              onClick={() =>
                window.open(
                  "https://www.facebook.com/buitrongkhanhduy/",
                  "_blank"
                )
              }
              className="w-10 h-10 ml-4"
            >
              <Image className="bg-cover" src={facebookImage} alt={""} />
            </button>
          </div>
          <button
            onClick={() =>
              window.open(
                "https://drive.google.com/file/d/1iFwSi4QhA01DvHbtcTBSBiDQPkjmoqEa/view?usp=sharing",
                "_blank"
              )
            }
            className="flex items-center h-30 w-50 justify-center"
          >
            <p className="absolute text-center text-white text-2xl">
              Download CV
            </p>
            <Image className="bg-cover" src={downCVImage} alt={""} />
          </button>
        </div>
        <Avatar
          sx={{ width: "20%", height: "10%" }}
          alt=""
          src={avatarImage.src}
        />
      </div>
    </div>
  );
};
