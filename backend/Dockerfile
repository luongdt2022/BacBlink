# Ảnh dùng chung cho api / worker / legacy-etl: chọn bằng --build-arg APP.
# Runtime .NET 10 (MIT, §26.8.2). Chạy bằng người dùng không đặc quyền.
ARG APP=apps/api
ARG ASSEMBLY=NacenTech.Api

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG APP
WORKDIR /src

# Restore theo lớp: chỉ đổi khi manifest đổi, không phải mỗi lần sửa mã.
COPY Directory.Build.props Directory.Packages.props global.json NacenTech.slnx ./
COPY packages/ packages/
COPY modules/ modules/
COPY apps/ apps/
COPY tools/ tools/
RUN dotnet restore "${APP}"

RUN dotnet publish "${APP}" -c Release -o /out --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
ARG ASSEMBLY
ENV ASSEMBLY_NAME=${ASSEMBLY}.dll \
    DOTNET_RUNNING_IN_CONTAINER=true \
    ASPNETCORE_HTTP_PORTS=8080

WORKDIR /app
COPY --from=build /out ./
# Rule set authorization là dữ liệu vận hành có version (§9.4.3), đi cùng ảnh.
COPY config/ ./config/

RUN useradd --uid 10001 --create-home --shell /usr/sbin/nologin nacentech \
 && mkdir -p /app/storage /app/artifacts \
 && chown -R nacentech:nacentech /app
USER nacentech

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec dotnet \"$ASSEMBLY_NAME\""]
