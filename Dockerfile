FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. CLEAR NuGet cache to remove Windows paths
RUN dotnet nuget locals all --clear

# 2. Copy solution and project files
COPY website.sln ./
COPY website.Server/website.Server.csproj ./website.Server/
COPY website.client/website.client.csproj ./website.client/

# 3. Restore WITHOUT any cached settings
RUN dotnet restore --force --ignore-failed-sources

# 4. Copy everything else
COPY . .

# 5. Publish
WORKDIR /src/website.Server
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENTRYPOINT ["dotnet", "website.Server.dll"]