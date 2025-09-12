import axios from "axios";
import React, { useEffect, useState } from "react";
import { server } from "../../server";

import { HiOutlineClock } from "react-icons/hi";

const CountDown = ({ data }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    if (
      typeof timeLeft.days === "undefined" &&
      typeof timeLeft.hours === "undefined" &&
      typeof timeLeft.minutes === "undefined" &&
      typeof timeLeft.seconds === "undefined"
    ) {
      axios.delete(`${server}/event/delete-shop-event/${data._id}`);
    }

    return () => clearTimeout(timer);
  });

  function calculateTimeLeft() {
    const difference = +new Date(data.Finish_Date) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }

  const timeComponents = [
    { label: "days", value: timeLeft.days },
    { label: "hours", value: timeLeft.hours },
    { label: "minutes", value: timeLeft.minutes },
    { label: "seconds", value: timeLeft.seconds },
  ].filter((component) => component.value !== undefined);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center mb-2">
        <HiOutlineClock className="w-4 h-4 text-blue-600 mr-2" />
        <span className="text-sm font-medium text-gray-700">
          Event ends in:
        </span>
      </div>

      {timeComponents.length ? (
        <div className="flex items-center space-x-2 flex-wrap">
          {timeComponents.map((component, index) => (
            <div key={component.label} className="flex items-center">
              <div className="bg-white rounded-md px-2 py-1 border border-gray-200 shadow-sm">
                <span className="text-lg font-bold text-blue-600">
                  {component.value}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  {component.label}
                </span>
              </div>
              {index < timeComponents.length - 1 && (
                <span className="text-gray-400 mx-1">:</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center">
          <span className="text-red-600 font-bold text-lg">⏰ Event Ended</span>
        </div>
      )}
    </div>
  );
};

export default CountDown;
