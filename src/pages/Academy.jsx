import React, { useState, useEffect } from 'react';
import { BookOpen, Award, TrendingUp, Lock, CheckCircle, Play, Trophy, Star, Users } from 'lucide-react';
import Sidebar from '../components/Layout/Sidebar';
import { academyAPI } from '../services/api';

const Academy = () => {
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('courses'); // courses, leaderboard

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, progressRes, leaderboardRes] = await Promise.all([
        academyAPI.getAllCourses(),
        academyAPI.getProgress(),
        academyAPI.getLeaderboard({ limit: 10 })
      ]);

      if (coursesRes.data.success) setCourses(coursesRes.data.data);
      if (progressRes.data.success) setUserProgress(progressRes.data.data);
      if (leaderboardRes.data.success) setLeaderboard(leaderboardRes.data.data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch academy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollCourse = async (courseId) => {
    try {
      const response = await academyAPI.enrollCourse(courseId);
      if (response.data.success) {
        fetchData();
        alert('Successfully enrolled! 🎉');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Enrollment failed');
    }
  };

  const openCourse = async (course) => {
    try {
      const response = await academyAPI.getCourse(course._id);
      if (response.data.success) {
        setSelectedCourse(response.data.data.course);
      }
    } catch (error) {
      console.error('Failed to load course:', error);
    }
  };

  const openChapter = (chapter) => {
    setSelectedChapter(chapter);
  };

  const completeChapter = async () => {
    if (!selectedCourse || !selectedChapter) return;

    try {
      const response = await academyAPI.completeChapter(
        selectedCourse._id,
        selectedChapter.chapterNumber,
        { timeSpent: 15 }
      );

      if (response.data.success) {
        alert(`🎉 Chapter completed! You earned ${response.data.data.pointsEarned} points!`);
        setSelectedChapter(null);
        setSelectedCourse(null);
        fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete chapter');
    }
  };

  const isChapterCompleted = (courseId, chapterNumber) => {
    if (!userProgress) return false;
    const courseProgress = userProgress.courses.find(c => c.course._id === courseId);
    return courseProgress?.completedChapters.some(ch => ch.chapterNumber === chapterNumber);
  };

  const getCourseProgress = (courseId) => {
    if (!userProgress) return null;
    return userProgress.courses.find(c => c.course._id === courseId);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading academy...</p>
          </div>
        </div>
      </div>
    );
  }

  // Chapter Detail Modal
  if (selectedChapter) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto p-8">
            <button
              onClick={() => setSelectedChapter(null)}
              className="mb-6 text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Course
            </button>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{selectedChapter.title}</h1>
                  <p className="text-gray-600">{selectedChapter.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-8 pb-6 border-b">
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="w-5 h-5" />
                  <span>{selectedChapter.points} Points</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Play className="w-5 h-5" />
                  <span>{selectedChapter.duration} min</span>
                </div>
              </div>

              {/* Chapter Content */}
              <div className="prose max-w-none mb-8">
                <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
                  {selectedChapter.content}
                </div>
              </div>

              {/* Key Takeaways */}
              {selectedChapter.keyTakeaways && selectedChapter.keyTakeaways.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    Key Takeaways
                  </h3>
                  <ul className="space-y-2">
                    {selectedChapter.keyTakeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Complete Chapter Button */}
              <div className="flex justify-end">
                <button
                  onClick={completeChapter}
                  className="btn-primary px-8 py-3 text-lg"
                  disabled={isChapterCompleted(selectedCourse._id, selectedChapter.chapterNumber)}
                >
                  {isChapterCompleted(selectedCourse._id, selectedChapter.chapterNumber) ? (
                    <>
                      <CheckCircle className="w-6 h-6 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Award className="w-6 h-6 mr-2" />
                      Complete Chapter
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Course Detail View
  if (selectedCourse) {
    const courseProgress = getCourseProgress(selectedCourse._id);
    
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto p-8">
            <button
              onClick={() => setSelectedCourse(null)}
              className="mb-6 text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Courses
            </button>

            {/* Course Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedCourse.title}</h1>
                  <p className="text-gray-600 text-lg">{selectedCourse.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600">{selectedCourse.totalPoints}</div>
                  <div className="text-gray-600">Total Points</div>
                </div>
              </div>

              {courseProgress && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{courseProgress.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all"
                      style={{ width: `${courseProgress.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{selectedCourse.chapters.length} Chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  <span>{selectedCourse.totalDuration} min</span>
                </div>
                <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {selectedCourse.level}
                </div>
              </div>
            </div>

            {/* Chapters List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Chapters</h2>
              {selectedCourse.chapters.map((chapter, index) => {
                const isCompleted = isChapterCompleted(selectedCourse._id, chapter.chapterNumber);
                const isLocked = index > 0 && !isChapterCompleted(selectedCourse._id, selectedCourse.chapters[index - 1].chapterNumber);

                return (
                  <div
                    key={chapter.chapterNumber}
                    className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all ${
                      isCompleted ? 'border-green-500' : 'border-gray-200'
                    } ${isLocked ? 'opacity-50' : 'hover:shadow-md cursor-pointer'}`}
                    onClick={() => !isLocked && openChapter(chapter)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-100' : isLocked ? 'bg-gray-100' : 'bg-primary-100'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : isLocked ? (
                            <Lock className="w-6 h-6 text-gray-400" />
                          ) : (
                            <span className="text-primary-600 font-bold">{chapter.chapterNumber}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{chapter.title}</h3>
                          <p className="text-gray-600 text-sm">{chapter.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          <span>{chapter.points} pts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          <span>{chapter.duration} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Academy View
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finance Academy</h1>
              <p className="text-gray-600 mt-1">Learn, Earn Points, and Master Your Finances</p>
            </div>
            
            {userProgress && (
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{userProgress.totalPoints}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{userProgress.level}</div>
                  <div className="text-sm text-gray-600">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{userProgress.streak.current}</div>
                  <div className="text-sm text-gray-600">Day Streak 🔥</div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'courses'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'courses' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courses.map(course => {
                const courseProgress = getCourseProgress(course._id);
                const isEnrolled = !!courseProgress;

                return (
                  <div key={course._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                          <p className="text-gray-600 text-sm">{course.description}</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.chapters.length} chapters</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          <span>{course.totalPoints} points</span>
                        </div>
                        <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          {course.level}
                        </div>
                      </div>

                      {isEnrolled && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{courseProgress.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all"
                              style={{ width: `${courseProgress.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => isEnrolled ? openCourse(course) : enrollCourse(course._id)}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                          isEnrolled
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-8 text-white text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold">Leaderboard</h2>
                  <p className="mt-2">Top learners this month</p>
                </div>

                <div className="p-6">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry._id}
                      className={`flex items-center justify-between p-4 rounded-lg mb-3 ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-yellow-400 text-white' :
                          index === 1 ? 'bg-gray-300 text-white' :
                          index === 2 ? 'bg-orange-400 text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{entry.user?.name || 'Anonymous'}</p>
                          <p className="text-sm text-gray-600">Level {entry.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">{entry.totalPoints}</p>
                        <p className="text-sm text-gray-600">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Academy;