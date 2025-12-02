# Use .NET 8.0 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["website.Server/website.Server.csproj", "website.Server/"]
RUN dotnet restore "website.Server/website.Server.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/website.Server"
RUN dotnet build "website.Server.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "website.Server.csproj" -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://*:8080
ENTRYPOINT ["dotnet", "website.Server.dll"]