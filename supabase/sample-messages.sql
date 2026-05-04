insert into messages (
  title,
  speaker,
  service_date,
  main_verse_reference,
  main_verse_text,
  bible_version,
  summary,
  key_points,
  full_notes,
  reflection_questions,
  related_verses,
  category
) values (
  'The Power of the Holy Spirit',
  'Pastor Name',
  '2026-05-03',
  'Acts 2:36-38',
  'Therefore let all Israel be assured of this: God has made this Jesus, whom you crucified, both Lord and Messiah.',
  'ESV',
  'This message reminds us that the Holy Spirit empowers believers to live boldly for Christ and respond to God with repentance and faith.',
  '[
    "Jesus is both Lord and Messiah.",
    "The Word of God calls people to repentance.",
    "The Holy Spirit empowers believers to live for Christ."
  ]'::jsonb,
  'The message focuses on Peter’s preaching in Acts 2 and the response of the people after hearing the gospel. It reminds the church that the Holy Spirit gives power, conviction, and direction to God’s people.',
  '[
    "How is God calling me to respond to His Word this week?",
    "Where do I need the help and power of the Holy Spirit?",
    "How can I boldly share Christ with others?"
  ]'::jsonb,
  '[
    {
      "reference": "Acts 1:8",
      "text": "But you will receive power when the Holy Spirit has come upon you...",
      "note": "This verse connects the Holy Spirit with power for witness."
    },
    {
      "reference": "John 14:26",
      "text": "But the Helper, the Holy Spirit, whom the Father will send in my name...",
      "note": "This verse shows the Holy Spirit as our Helper and Teacher."
    }
  ]'::jsonb,
  'Holy Spirit'
);
