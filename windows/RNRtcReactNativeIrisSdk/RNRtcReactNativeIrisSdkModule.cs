using ReactNative.Bridge;
using System;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;

namespace Rtc.React.Native.Iris.Sdk.RNRtcReactNativeIrisSdk
{
    /// <summary>
    /// A module that allows JS to share data.
    /// </summary>
    class RNRtcReactNativeIrisSdkModule : NativeModuleBase
    {
        /// <summary>
        /// Instantiates the <see cref="RNRtcReactNativeIrisSdkModule"/>.
        /// </summary>
        internal RNRtcReactNativeIrisSdkModule()
        {

        }

        /// <summary>
        /// The name of the native module.
        /// </summary>
        public override string Name
        {
            get
            {
                return "RNRtcReactNativeIrisSdk";
            }
        }
    }
}
