// import { useSignIn } from "@clerk/clerk-expo";
// import { Link, useRouter } from "expo-router";
// import { Text, TextInput, TouchableOpacity, View, Image } from "react-native";
// import { useState } from "react";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import { styles } from "../../assets/styles/auth.styles";
// import { Ionicons } from "@expo/vector-icons";
// import { COLORS } from "../../constants/colors";

// export default function Page() {
//   const { signIn, setActive, isLoaded } = useSignIn();
//   const router = useRouter();

//   const [emailAddress, setEmailAddress] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   // Handle the submission of the sign-in form
//   const onSignInPress = async () => {
//     if (!isLoaded) return;

//     // Start the sign-in process using the email and password provided
//     try {
//       const signInAttempt = await signIn.create({
//         identifier: emailAddress,
//         password,
//       });

//       // If sign-in process is complete, set the created session as active
//       // and redirect the user
//       if (signInAttempt.status === "complete") {
//         await setActive({ session: signInAttempt.createdSessionId });
//         router.replace("/");
//       } else {
//         // If the status isn't complete, check why. User might need to
//         // complete further steps.
//         console.error(JSON.stringify(signInAttempt, null, 2));
//       }
//     } catch (err) {
//       if (err.errors?.[0]?.code === "form_password_incorrect") {
//         setError("Password is incorrect. Please try again.");
//       } else {
//         setError("An error occurred. Please try again.");
//       }
//     }
//   };

//   return (
//     <KeyboardAwareScrollView
//       style={{ flex: 1 }}
//       contentContainerStyle={{ flexGrow: 1 }}
//       enableOnAndroid={true}
//       enableAutomaticScroll={true}
//       extraScrollHeight={30}
//     >
//       <View style={styles.container}>
//         <Image
//           source={require("../../assets/images/revenue-i4.png")}
//           style={styles.illustration}
//         />
//         <Text style={styles.title}>Welcome Back</Text>

//         {error ? (
//           <View style={styles.errorBox}>
//             <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
//             <Text style={styles.errorText}>{error}</Text>
//             <TouchableOpacity onPress={() => setError("")}>
//               <Ionicons name="close" size={20} color={COLORS.textLight} />
//             </TouchableOpacity>
//           </View>
//         ) : null}

//         <TextInput
//           style={[styles.input, error && styles.errorInput]}
//           autoCapitalize="none"
//           value={emailAddress}
//           placeholder="Enter email"
//           placeholderTextColor="#9A8478"
//           onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
//         />

//         <TextInput
//           style={[styles.input, error && styles.errorInput]}
//           value={password}
//           placeholder="Enter password"
//           placeholderTextColor="#9A8478"
//           secureTextEntry={true}
//           onChangeText={(password) => setPassword(password)}
//         />

//         <TouchableOpacity style={styles.button} onPress={onSignInPress}>
//           <Text style={styles.buttonText}>Sign In</Text>
//         </TouchableOpacity>

//         <View style={styles.footerContainer}>
//           <Text style={styles.footerText}>Don&apos;t have an account?</Text>

//           <Link href="/sign-up" asChild>
//             <TouchableOpacity>
//               <Text style={styles.linkText}>Sign up</Text>
//             </TouchableOpacity>
//           </Link>
//         </View>
//       </View>
//     </KeyboardAwareScrollView>
//   );
// }

import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { styles } from "../../assets/styles/auth.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");

  // 🔐 Step 1: Sign In + Send OTP
  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      }

      // 👉 NEED OTP
      else if (signInAttempt.status === "needs_second_factor") {
        await signIn.prepareSecondFactor({
          strategy: "email_code",
        });

        setPendingVerification(true);
      } else {
        console.log(signInAttempt);
      }
    } catch (err) {
      if (err.errors?.[0]?.code === "form_password_incorrect") {
        setError("Password is incorrect. Please try again.");
      } else {
        setError("Something went wrong. Try again.");
      }
      console.log(err);
    }
  };

  // 🔐 Step 2: Verify OTP
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const attempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      } else {
        console.log(attempt);
      }
    } catch (err) {
      setError("Invalid OTP. Try again.");
      console.log(err);
    }
  };

  // 🔥 OTP SCREEN
  if (pendingVerification) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>Verify your email</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.verificationInput, error && styles.errorInput]}
          value={code}
          placeholder="Enter OTP"
          placeholderTextColor="#9A8478"
          onChangeText={(code) => setCode(code)}
        />

        <TouchableOpacity onPress={onVerifyPress} style={styles.button}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🔥 SIGN IN SCREEN
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/revenue-i4.png")}
          style={styles.illustration}
        />

        <Text style={styles.title}>Welcome Back</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#9A8478"
          onChangeText={(email) => setEmailAddress(email)}
        />

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#9A8478"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />

        <TouchableOpacity style={styles.button} onPress={onSignInPress}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account?</Text>

          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
