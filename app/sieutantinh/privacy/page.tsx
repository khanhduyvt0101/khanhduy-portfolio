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
          Chính Sách Bảo Mật
        </h1>
        <p>Cập nhật lần cuối: 01/07/2024</p>
        <p className="mt-6 text-xl leading-8">
          {`Cảm ơn bạn đã sử dụng ứng dụng Sieu Tan Tinh ("Ứng Dụng"). Chúng tôi cam kết bảo vệ sự riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng Ứng Dụng.`}
        </p>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Thông Tin Chúng Tôi Thu Thập
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>Chúng tôi có thể thu thập và xử lý các loại thông tin sau:</p>
          <ul className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Thông tin cá nhân:
                </strong>{" "}
                Tên, địa chỉ email, số điện thoại.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Thông tin đăng ký:
                </strong>{" "}
                Khi bạn đăng ký sử dụng các dịch vụ của chúng tôi, chúng tôi thu
                thập thông tin cần thiết để hoàn tất đăng ký.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Thông tin thanh toán:
                </strong>{" "}
                Nếu bạn thực hiện các giao dịch mua hàng qua Ứng Dụng, chúng tôi
                sẽ thu thập thông tin cần thiết để xử lý thanh toán.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Thông tin kỹ thuật:
                </strong>{" "}
                Địa chỉ IP, loại thiết bị, hệ điều hành, và dữ liệu sử dụng.
              </span>
            </li>
          </ul>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Cách Chúng Tôi Sử Dụng Thông Tin
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>Chúng tôi sử dụng thông tin của bạn để:</p>
          <ul className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <PiFactoryBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>Cung cấp, duy trì và cải thiện Ứng Dụng.</span>
            </li>
            <li className="flex gap-x-3">
              <PiChatsCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>Xử lý các giao dịch và quản lý tài khoản của bạn.</span>
            </li>
            <li className="flex gap-x-3">
              <PiChartLineBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>Gửi các thông báo về cập nhật và khuyến mại.</span>
            </li>
            <li className="flex gap-x-3">
              <PiGavelBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>Tăng cường bảo mật và ngăn chặn gian lận.</span>
            </li>
            <li className="flex gap-x-3">
              <PiGavelBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>Tuân thủ các yêu cầu pháp lý và quy định.</span>
            </li>
          </ul>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Chia Sẻ Thông Tin Với Bên Thứ Ba
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            Chúng tôi không bán, trao đổi hoặc chuyển giao thông tin cá nhân của
            bạn cho các bên thứ ba, ngoại trừ các trường hợp sau:
          </p>
          <ul className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <PiFlagCheckeredBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                Các nhà cung cấp dịch vụ: Chúng tôi có thể chia sẻ thông tin với
                các bên cung cấp dịch vụ để hỗ trợ chúng tôi trong việc vận hành
                Ứng Dụng.
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiFlagCheckeredBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                Các yêu cầu pháp lý: Chúng tôi có thể tiết lộ thông tin của bạn
                nếu điều này cần thiết để tuân thủ các yêu cầu pháp lý hoặc điều
                tra các hành vi vi phạm.
              </span>
            </li>
          </ul>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Quyền Của Bạn
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>Bạn có quyền:</p>
          <ul className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Truy cập và cập nhật thông tin cá nhân của mình.
                </strong>
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Yêu cầu xóa thông tin cá nhân.
                </strong>
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Hạn chế hoặc phản đối việc xử lý thông tin cá nhân của bạn.
                </strong>
              </span>
            </li>
            <li className="flex gap-x-3">
              <PiCheckCircleBold
                className="mt-1 size-5 flex-none text-indigo-600"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-gray-900">
                  Rút lại sự đồng ý bất kỳ lúc nào (điều này không ảnh hưởng đến
                  tính hợp pháp của việc xử lý dựa trên sự đồng ý trước khi nó
                  bị rút lại).
                </strong>
              </span>
            </li>
          </ul>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Bảo Mật Thông Tin
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            Chúng tôi thực hiện các biện pháp bảo mật hợp lý để bảo vệ thông tin
            cá nhân của bạn khỏi mất mát, lạm dụng và truy cập trái phép. Tuy
            nhiên, không có phương thức truyền tải qua Internet hoặc phương thức
            lưu trữ điện tử nào là an toàn 100%, vì vậy chúng tôi không thể đảm
            bảo tuyệt đối an toàn thông tin của bạn.
          </p>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Thay Đổi Chính Sách Bảo Mật
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            Chúng tôi có thể cập nhật Chính Sách Bảo Mật này theo thời gian.
            Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng
            Chính Sách Bảo Mật mới trên trang web và/hoặc Ứng Dụng. Bạn nên kiểm
            tra Chính Sách Bảo Mật này định kỳ để đảm bảo bạn nhận thức được bất
            kỳ thay đổi nào.
          </p>
        </div>

        <h3 className="mt-10 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Liên Hệ
        </h3>
        <div className="mt-2 max-w-2xl">
          <p>
            Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào về Chính Sách Bảo Mật
            này, vui lòng liên hệ với chúng tôi qua:
          </p>
          <p>Email: khanhduyvt0101@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
