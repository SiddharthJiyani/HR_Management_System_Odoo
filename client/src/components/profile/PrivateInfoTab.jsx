import React, { useState } from 'react';
import { Card, Button } from '../ui';

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EditableCard = ({ title, icon, content, onSave, isEditable = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content);

  const handleSave = () => {
    onSave?.(text);
    setIsEditing(false);
  };

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
          {title}
          {icon && <span>{icon}</span>}
        </h3>
        {isEditable && (
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          >
            {isEditing ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <EditIcon />
            )}
          </button>
        )}
      </div>
      
      {isEditing && isEditable ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-white/80 border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all resize-none"
        />
      ) : (
        <p className="text-sm text-neutral-600 leading-relaxed">
          {text || (isEditable ? 'Click edit to add content...' : 'No information provided')}
        </p>
      )}
    </Card>
  );
};

const TagCard = ({ title, items = [], onAdd, onRemove, placeholder = 'Add new item', isEditable = true }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd?.(newItem.trim());
      setNewItem('');
      setIsAdding(false);
    }
  };

  return (
    <Card className="h-full">
      <h3 className="font-semibold text-neutral-900 mb-4">{title}</h3>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100/50 rounded-full group"
          >
            <span className="text-sm font-medium text-neutral-700">{item}</span>
            {isEditable && (
              <button
                onClick={() => onRemove?.(index)}
                className="w-4 h-4 rounded-full text-neutral-400 hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        ))}
        
        {items.length === 0 && !isAdding && (
          <p className="text-sm text-neutral-400">No items added yet</p>
        )}
      </div>

      {/* Add New - Only show if editable */}
      {isEditable && (
        <>
          {isAdding ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 bg-white/80 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                autoFocus
              />
              <Button size="sm" onClick={handleAdd}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <PlusIcon />
              + Add {title.replace('s', '')}
            </button>
          )}
        </>
      )}
    </Card>
  );
};

const PrivateInfoTab = ({ data, onUpdate, isEditable = true }) => {
  const [privateInfo, setPrivateInfo] = useState({
    about: data?.about || (isEditable ? 'Lorem ipsum is simply dummy text of the printing and typesetting industry.' : 'No information provided'),
    whatILove: data?.whatILove || (isEditable ? 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' : 'No information provided'),
    hobbies: data?.hobbies || (isEditable ? 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' : 'No information provided'),
    skills: data?.skills || [],
    certifications: data?.certifications || [],
  });

  const handleUpdateField = (field, value) => {
    setPrivateInfo(prev => ({ ...prev, [field]: value }));
    onUpdate?.({ ...privateInfo, [field]: value });
  };

  const handleAddSkill = (skill) => {
    const newSkills = [...privateInfo.skills, skill];
    handleUpdateField('skills', newSkills);
  };

  const handleRemoveSkill = (index) => {
    const newSkills = privateInfo.skills.filter((_, i) => i !== index);
    handleUpdateField('skills', newSkills);
  };

  const handleAddCertification = (cert) => {
    const newCerts = [...privateInfo.certifications, cert];
    handleUpdateField('certifications', newCerts);
  };

  const handleRemoveCertification = (index) => {
    const newCerts = privateInfo.certifications.filter((_, i) => i !== index);
    handleUpdateField('certifications', newCerts);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Left Column - Text Cards */}
      <div className="lg:col-span-2 space-y-4">
        <EditableCard 
          title="About"
          icon="✏️"
          content={privateInfo.about}
          onSave={(text) => handleUpdateField('about', text)}
          isEditable={isEditable}
        />
        
        <EditableCard 
          title="What I love about my job"
          icon="✏️"
          content={privateInfo.whatILove}
          onSave={(text) => handleUpdateField('whatILove', text)}
          isEditable={isEditable}
        />
        
        <EditableCard 
          title="My interests and hobbies"
          icon="✏️"
          content={privateInfo.hobbies}
          onSave={(text) => handleUpdateField('hobbies', text)}
          isEditable={isEditable}
        />
      </div>

      {/* Right Column - Tags */}
      <div className="space-y-4">
        <TagCard 
          title="Skills"
          items={privateInfo.skills}
          onAdd={handleAddSkill}
          onRemove={handleRemoveSkill}
          placeholder="Add a skill"
          isEditable={isEditable}
        />
        
        <TagCard 
          title="Certifications"
          items={privateInfo.certifications}
          onAdd={handleAddCertification}
          onRemove={handleRemoveCertification}
          placeholder="Add a certification"
          isEditable={isEditable}
        />
      </div>
    </div>
  );
};

export default PrivateInfoTab;
