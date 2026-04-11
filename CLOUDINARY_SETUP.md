# Cloudinary Setup Guide for TicketBro

All image uploads in TicketBro (avatars, event covers, gallery images, organizer logos and banners) are stored on **Cloudinary**. This replaces the previous local disk storage.

---

## 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com) and sign up (free tier is plenty for development).
2. After logging in, go to your **Dashboard**.
3. Note down your:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## 2. Configure Environment Variables

In `backend/.env`, fill in the three Cloudinary variables:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> ⚠️ Never commit real credentials to Git. Use `.env` which is already in `.gitignore`.

---

## 3. How images are organised in Cloudinary

```
ticketbro/
  avatars/              ← user profile pictures
    avatar-<userId>     ← stable public_id (overwrites on re-upload)
  events/
    covers/             ← event cover/banner images
      cover-<eventId>   ← stable public_id
    gallery/            ← event gallery images
      <eventId>-<ts>-<i>
  organizers/
    logos/
      logo-<organizerId>
    banners/
      banner-<organizerId>
```

Stable `public_id`s mean re-uploading replaces the asset **and invalidates the CDN cache automatically**.

---

## 4. Install the Cloudinary package

```bash
cd backend
npm install
```

`cloudinary` v2 is already added to `package.json`.

---

## 5. Transformations applied automatically

| Context          | Transformation                              |
|------------------|---------------------------------------------|
| Avatar           | 400×400 face-crop, quality auto, format auto |
| Event cover      | 1200×630 fill, quality auto, format auto     |
| Event gallery    | 1200px wide limit, quality auto, format auto |
| Organizer logo   | 400×400 pad, quality auto, format auto       |
| Organizer banner | 1500×500 fill, quality auto, format auto     |

---

## 6. Available API endpoints

### Avatars
| Method | URL                          | Description            |
|--------|------------------------------|------------------------|
| POST   | `/api/v1/users/me/avatar`    | Upload / replace avatar |
| DELETE | `/api/v1/users/me/avatar`    | Remove avatar          |

### Event images
| Method | URL                                        | Description             |
|--------|--------------------------------------------|-------------------------|
| POST   | `/api/v1/events/:slug/images/cover`        | Upload / replace cover  |
| DELETE | `/api/v1/events/:slug/images/cover`        | Remove cover            |
| POST   | `/api/v1/events/:slug/images/gallery`      | Add gallery images      |
| DELETE | `/api/v1/events/:slug/images/gallery`      | Remove one gallery image (body: `{ url }`) |

### Organizer images
| Method | URL                                  | Description              |
|--------|--------------------------------------|--------------------------|
| POST   | `/api/v1/organizer/images/logo`      | Upload / replace logo    |
| DELETE | `/api/v1/organizer/images/logo`      | Remove logo              |
| POST   | `/api/v1/organizer/images/banner`    | Upload / replace banner  |
| DELETE | `/api/v1/organizer/images/banner`    | Remove banner            |

---

## 7. Frontend components

### `<ImageUpload />` — generic reusable widget
```jsx
import { ImageUpload } from "@/components/shared";

<ImageUpload
  currentUrl={event.coverImage}
  onUpload={async (file) => { /* call API */ }}
  onRemove={async ()    => { /* call API */ }}
  isUploading={isLoading}
  shape="banner"       // "circle" | "square" | "logo" | "banner"
  maxSizeMB={10}
  multiple={false}     // true for gallery
  label="Upload cover"
  hint="Max 10 MB"
/>
```

### `<AvatarUpload />` — dialog-based avatar manager
```jsx
import AvatarUpload from "@/components/roles/user/AvatarUpload";

<AvatarUpload user={user} open={open} onOpenChange={setOpen} />
```

### `<EventImageManager />` — cover + gallery for organizers
```jsx
import EventImageManager from "@/components/roles/organizer/EventImageManager";

<EventImageManager event={event} onUpdated={(updated) => setEvent(updated)} />
```

### `<OrganizerImageManager />` — logo + banner for organizer profile
```jsx
import OrganizerImageManager from "@/components/roles/organizer/OrganizerImageManager";

<OrganizerImageManager organizer={organizer} onUpdated={(updated) => setOrganizer(updated)} />
```
