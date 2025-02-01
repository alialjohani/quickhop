// import React, { useEffect } from "react";
// import "amazon-connect-streams";

// const ccpUrl = ""; // Replace with your CCP URL
// const awsRegion = ""; // Replace with your AWS region (e.g., "us-east-1")

// type MakingOutboundCallType = (phoneNumber: string) => void;

// const useOutboundCall = (): MakingOutboundCallType => {
//   useEffect(() => {
//     try {
//       // Initialize the CCP on component mount
//       connect.core.initCCP(document.getElementById("ccp-container")!, {
//         ccpUrl,
//         loginPopup: false,
//         region: awsRegion,
//       });

//       console.log(">>>>> CCP Initialized");
//     } catch (error) {
//       console.log(">>>>> CCP Initialized error: ", error);
//     }
//   }, []);

//   const makeOutboundCall = (phoneNumber: string): void => {
//     try {
//       connect.agent(function (agent) {
//         if (agent) {
//           agent.onRefresh(() => {
//             console.log(">>>>> Agent data refreshed");
//           });

//           agent.connect(connect.Endpoint.byPhoneNumber(phoneNumber), {
//             success: function () {
//               console.log(">>>>> outbound call connected");
//             },
//             failure: function (err) {
//               console.log(">>>>> outbound call connection failed");
//               console.log(err);
//             },
//           });
//           console.log(`>>>>> Initiating call to: ${phoneNumber}`);
//         } else {
//           console.error(
//             ">>>>> Agent instance not found. Ensure CCP is initialized correctly.",
//           );
//         }
//       }); // Fetch the agent instance
//     } catch (error) {
//       console.log(">>>>> MakeCall error: ", error);
//     }
//   };

//   return makeOutboundCall;
// };

// export default useOutboundCall;
