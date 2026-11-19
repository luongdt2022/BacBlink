using NacenTech.Kernel.Domain;
using NacenTech.Modules.Identity.Application;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Contracts;

/// <summary>
/// B-37. `ValidationException` từng có hai hàm dựng, và với một đối số chuỗi duy nhất — dạng gọi của 41 trong
/// 46 chỗ trong mã — phân giải nạp chồng chọn hàm nhận mã lỗi. Câu lỗi trở thành **mã**, `Message` thành
/// **chuỗi rỗng**, và mọi phản hồi 400 trên cả hai bề mặt mất câu giải thích:
/// `{"statusCode":400,"message":"","error":"Bad Request"}` ở v1, `"detail": ""` ở v2.
///
/// Lỗi này im lặng theo đúng nghĩa xấu nhất: mã biên dịch sạch, không ngoại lệ nào bị nuốt, đúng mã trạng thái
/// được trả về — chỉ có câu chữ biến mất. Không test nào trong 44 bài ban đầu chạm tới nó, và nó sống qua cả
/// một đợt rà soát tài liệu vốn còn trích dẫn những câu lỗi chưa bao giờ tới được người dùng.
/// </summary>
public sealed class ValidationExceptionShapeTests
{
    [Fact]
    public void A_single_message_stays_a_message_and_does_not_become_a_code()
    {
        var ex = new ValidationException("title should not be empty");

        ex.Message.ShouldBe("title should not be empty");
        ex.Code.ShouldBe("VALIDATION_FAILED");
        ex.Errors.ShouldBe(["title should not be empty"]);
    }

    [Fact]
    public void Several_messages_are_joined_and_all_kept_for_the_errors_array()
    {
        var ex = new ValidationException("email must be a valid email", "password is too short");

        ex.Message.ShouldBe("email must be a valid email; password is too short");
        ex.Errors.Count.ShouldBe(2);
    }

    /// <summary>Mã nghiệp vụ vẫn đi được — nhưng qua một đường có tên, không qua một hàm dựng dễ trúng nhầm.</summary>
    [Fact]
    public void A_business_code_travels_without_eating_the_message()
    {
        var ex = ValidationException.WithCode(AuthCodes.ConfirmPasswordMismatch, "Confirm password does not match");

        ex.Code.ShouldBe(AuthCodes.ConfirmPasswordMismatch);
        ex.Message.ShouldBe("Confirm password does not match");
        ex.Errors.ShouldBe(["Confirm password does not match"]);
    }

    /// <summary>
    /// Không bao giờ được có một `ValidationException` mang câu rỗng: đó chính là hình dạng của lỗi cũ, và nó
    /// đi tới người dùng dưới dạng một hộp thoại lỗi trống.
    /// </summary>
    [Fact]
    public void No_construction_path_produces_an_empty_message()
    {
        new ValidationException("một câu").Message.ShouldNotBeNullOrWhiteSpace();
        ValidationException.WithCode("SOME_CODE", "một câu").Message.ShouldNotBeNullOrWhiteSpace();
    }
}
