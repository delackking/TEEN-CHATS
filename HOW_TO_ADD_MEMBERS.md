# How to Add Members to a Group in TeenChat

## User Guide

### Step-by-Step Instructions:

1. **Open a Group Chat**
   - Click on a group from the sidebar
   - The group chat will open in the main window

2. **Click "Add Members" Button**
   - Look for the user icon with a plus sign (➕👥) in the top-right corner of the chat header
   - Click this button to open the "Add Member" modal

3. **Search for Users**
   - Type the user's ID, username, or nickname in the search box
   - Press Enter or click "Search"

4. **Add the User**
   - Click the "Add" button next to the user you want to add
   - The user will be added to the group immediately

5. **Done!**
   - The modal will close automatically
   - The new member can now see and participate in the group chat

---

## Technical Details

### API Endpoint
The app uses this endpoint to add members:
```
POST /api/groups/{groupId}/members
Body: { "userId": "user-id-here" }
```

### Features:
- ✅ Search users by ID, username, or nickname
- ✅ Real-time member addition
- ✅ Automatic group update
- ✅ Error handling for duplicate members
- ✅ Clean modal UI

### UI Components Added:
1. **AddMemberModal.tsx** - Modal component for searching and adding users
2. **AddMemberModal.module.css** - Styling for the modal
3. **ChatWindow.tsx** - Updated with "Add Members" button for groups

---

## What I Just Added:

### 1. Add Member Button
- Located in the group chat header (top-right)
- Only visible when viewing a group (not DMs)
- Icon: User with plus sign

### 2. Add Member Modal
- Search functionality for finding users
- Displays user nickname, username, and ID
- One-click add button for each user
- Automatic close on success

### 3. User Search
- Search by:
  - User ID (e.g., "abc123xyz")
  - Username (e.g., "john_doe")
  - Nickname (e.g., "John")
- Shows up to 10 results

---

## Next Steps to Deploy This Update:

```bash
# Commit the changes
git add .
git commit -m "Add group member management UI"
git push origin main
```

Vercel will automatically deploy the update!

---

## Screenshot Guide (How it looks):

**Group Chat Header:**
```
┌─────────────────────────────────────────┐
│ 👥 My Group                        ➕👥 │ ← Click here
│ 5 members                               │
└─────────────────────────────────────────┘
```

**Add Member Modal:**
```
┌──────────────────────────────────────┐
│ Add Member to Group              ✕  │
├──────────────────────────────────────┤
│ [Search by ID or username...] 🔍    │
├──────────────────────────────────────┤
│ 👤 Alice Johnson                     │
│    @alice • abc123xyz         [Add]  │
│                                      │
│ 👤 Bob Smith                         │
│    @bob • def456uvw           [Add]  │
└──────────────────────────────────────┘
```

---

## Features Summary:

✅ **Easy to Use** - Just click, search, and add
✅ **Fast Search** - Find users by ID or name
✅ **Real-time** - Members added instantly
✅ **Clean UI** - Modal overlay with smooth animations
✅ **Error Handling** - Shows errors if user already in group

Your TeenChat app now has full group member management! 🎉
