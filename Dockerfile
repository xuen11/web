FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore
COPY *.csproj ./
RUN dotnet restore

# 2. RESTORE PROPERLY (no --no-restore flag)
RUN dotnet restore website.sln

# 3. Copy everything else
COPY . .

# 4. PUBLISH WITHOUT --no-restore
WORKDIR /src/website.Server
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENTRYPOINT ["dotnet", "website.Server.dll"]