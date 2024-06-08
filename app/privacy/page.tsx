import type { ReactNode } from "react";

import {
  PiChartLineBold,
  PiChatsCircleBold,
  PiCheckCircleBold,
  PiFactoryBold,
  PiFlagCheckeredBold,
  PiGavelBold,
} from "react-icons/pi";

export default function Page(): ReactNode {
  return (
    <div className="px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-6 text-xl leading-8">
          {` This Privacy Policy outlines how the khanhduy.site Chrome extension
          "we", "our", or "us" collects, uses, stores, and shares your
          personal information when you use our extension and related services.
          We are committed to ensuring the privacy and security of your
          information.`}
        </p>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Information We Collect
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            When you use our extension, we collect information about you in the
            following categories:
          </p>
          <ul className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Personal Information:
                </strong>{" "}
                This includes your name, email address, and any other details
                you provide us voluntarily, especially during the authentication
                process using Google sign-in managed by clerk.com.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Usage Information:
                </strong>{" "}
                We track how you use the extension, including interactions with
                our platform, your preferences, and settings.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Device Information:
                </strong>{" "}
                Information about the device you use to access our extension,
                like device type, operating system, and browser type, may be
                collected.
              </span>
            </li>
          </ul>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          How We Use Your Information
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>The information we collect is used in various ways, such as to:</p>
          <ul className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <PiFactoryBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                Provide, maintain, and improve the extension and related
                services.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiChatsCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                Communicate with you about updates, promotions, and other
                relevant information.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiChartLineBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                Conduct research and analysis to enhance our services and
                develop new features.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiGavelBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                Comply with legal requirements and protect our rights and
                interests.
              </span>
            </li>
          </ul>
          <p className="mt-8">
            Information is collected to improve the service, communicate with
            users, conduct research, and comply with legal requirements. These
            efforts aim to enhance user experience, ensure legal compliance, and
            protect the company’s interests.
          </p>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Handling of Google User Data
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>For users opting to sign in with Google:</p>
          <ul className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Authentication and Profile Access:
                </strong>{" "}
                We use Google data solely for authentication and accessing your
                Google user profile through clerk.com. This includes retrieving
                your Google profile information such as your name and email
                address to create or update your user profile on our platform.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Data Usage:
                </strong>{" "}
                The Google user data we access is strictly limited to the
                purposes of authentication and improving your user experience on
                khanhduy.site. We do not access, store, or share your Google
                user data for any other purposes.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Clerk.com Integration:
                </strong>{" "}
                Authentication and user management, including the handling of
                Google sign-in, are facilitated by clerk.com to ensure secure
                and efficient user access to our services.
              </span>
            </li>
          </ul>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Information Sharing
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            Your personal information may be shared with third parties in
            certain circumstances, including:
          </p>
          <ul className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <PiFlagCheckeredBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>With your consent.</span>
            </li>
            <li className="flex gap-x-3">
              <PiFlagCheckeredBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                To comply with legal obligations or respond to lawful requests
                from authorities.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiFlagCheckeredBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                To protect our rights, property, or safety, or that of others.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiFlagCheckeredBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                In connection with a merger, acquisition, or sale of assets.
              </span>
            </li>
          </ul>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Your Choices
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            You have rights regarding the management of your personal
            information:
          </p>
          <ul className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Access and Control:
                </strong>{" "}
                You can access, update, or delete your personal information at
                any time.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Opt-out:
                </strong>{" "}
                You have the option to opt-out of receiving promotional
                communications from us.
              </span>
            </li>
          </ul>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Data Security
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            We implement appropriate security measures to protect your personal
            information against unauthorized access, disclosure, alteration, or
            destruction.
          </p>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Changes to This Policy
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            We reserve the right to update this Privacy Policy periodically. Any
            significant changes will be notified to you by posting the updated
            policy on this page.
          </p>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Contact Us
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            For questions or concerns regarding this Privacy Policy, please
            contact us at khanhduyvt0101@gmail.com.
          </p>
        </div>
      </div>
    </div>
  );
}
