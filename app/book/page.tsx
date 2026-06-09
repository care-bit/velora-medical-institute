import { redirect } from "next/navigation"

export default function BookPage() {
  redirect(
    "https://ehr.charmtracker.com/publicCal.sas?method=getCal&digest=169f4dd01960b6c31cb1f577544c70e574ed96d3d580cebc1192a3b4b068b2f4c791341ca9a05ba47b16a2ad35a972fba0ae868b6eb0918a"
  )
} 