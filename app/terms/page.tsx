import type { ReactNode } from "react";
import { PiCheckCircleBold } from "react-icons/pi";

export default function Page(): ReactNode {
  return (
    <div className="px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-6 text-xl leading-8">
          {`These Terms of Service ("Terms") govern your use of the khanhduy.site Chrome extension (the "Service"). Please read these Terms carefully before accessing or using the Service.`}
        </p>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Acceptance of Terms
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            By accessing or using the Service, you agree to be bound by these
            Terms. If you do not agree to these Terms, you may not use the
            Service.
          </p>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Use of the Service
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            You must be at least 18 years old to use the Service. By using the
            Service, you represent and warrant that you are at least 18 years
            old. You agree to use the Service only for lawful purposes and in
            accordance with these Terms. You may not:
          </p>
          <ul className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                Use the Service in any way that violates applicable laws or
                regulations.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                Impersonate any person or entity or falsely state or otherwise
                misrepresent your affiliation with a person or entity.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                Attempt to gain unauthorized access to any portion of the
                Service, other accounts, or computer systems connected to the
                Service.
              </span>
            </li>
          </ul>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Limitation of Liability
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            To the fullest extent permitted by applicable law, khanhduy.site
            shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, or any loss of profits or
            revenues, whether incurred directly or indirectly, or any loss of
            data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                Your access to or use of or inability to access or use the
                Service.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                Any conduct or content of any third party on the Service.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>Any content obtained from the Service.</span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                Unauthorized access, use, or alteration of your transmissions or
                content.
              </span>
            </li>
          </ul>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Intellectual Property
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            The Service and its original content, features, and functionality
            are owned by khanhduy.site and are protected by international
            copyright, trademark, patent, trade secret, and other intellectual
            property or proprietary rights laws.
          </p>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          User Content
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            {`You may have the opportunity to submit, post, or display content on the Service ("User Content"). By submitting User Content, you grant khanhduy.site a non-exclusive, royalty-free, worldwide, perpetual, and irrevocable license to use, reproduce, modify, adapt, publish, translate, distribute, and display such User Content on the Service.`}
          </p>
          <p>
            You are solely responsible for your User Content and the
            consequences of posting or publishing it. You represent and warrant
            that you have all necessary rights to grant the licenses granted
            herein.
          </p>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Changes to Terms
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            We reserve the right to modify or replace these Terms at any time.
            If a revision is material, we will provide at least 30 days’ notice
            prior to any new terms taking effect. What constitutes a material
            change will be determined at our sole discretion.
          </p>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Contact Us
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            If you have any questions about these Terms, please contact us at
            khanhduyvt0101@gmail.com.
          </p>
        </div>
      </div>
    </div>
  );
}
